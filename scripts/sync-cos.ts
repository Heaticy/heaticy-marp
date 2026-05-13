import path from "node:path";
import { promises as fs } from "node:fs";

import COS from "cos-nodejs-sdk-v5";

import { buildThemes } from "./build-themes.ts";
import { repoRoot } from "./lib/runtime.ts";
import { walkFiles, toPosix } from "./lib/theme-utils.ts";

const secretConfig = await loadSecretConfig();
const bucket = secretConfig.bucket ?? process.env.COS_BUCKET ?? "heaticy-1310163554";
const region = secretConfig.region ?? process.env.COS_REGION ?? "ap-shanghai";
const prefix = (secretConfig.path ?? process.env.COS_PREFIX ?? "markdown/heaticy-marp").replace(/^\/+|\/+$/g, "");
const secretId = secretConfig.secretId ?? process.env.COS_SECRET_ID;
const secretKey = secretConfig.secretKey ?? process.env.COS_SECRET_KEY;

if (!secretId || !secretKey) {
  throw new Error("Missing COS credentials in secret.yaml or environment");
}

const client = new COS({
  SecretId: secretId,
  SecretKey: secretKey,
});

async function main() {
  await buildThemes();

  const uploads = [
    {
      localRoot: path.join(repoRoot, "dist", "themes"),
      remoteRoot: `${prefix}/themes`,
    },
    {
      localRoot: path.join(repoRoot, "shared-assets"),
      remoteRoot: `${prefix}/assets`,
    },
  ];

  for (const upload of uploads) {
    const files = await walkFiles(upload.localRoot);

    for (const file of files) {
      const relativeFile = toPosix(path.relative(upload.localRoot, file));
      const key = `${upload.remoteRoot}/${relativeFile}`;
      const body = await fs.readFile(file);
      await putObject(key, body, contentType(file));
      console.log(`[sync-cos] ${toPosix(path.relative(repoRoot, file))} -> ${key}`);
    }
  }
}

function putObject(key: string, body: Buffer, contentTypeValue: string) {
  return new Promise<void>((resolve, reject) => {
    client.putObject(
      {
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: body,
        ContentType: contentTypeValue,
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
    );
  });
}

function contentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

async function loadSecretConfig(): Promise<{
  bucket?: string;
  region?: string;
  path?: string;
  secretId?: string;
  secretKey?: string;
}> {
  const secretFile = path.join(repoRoot, "secret.yaml");

  try {
    const source = await fs.readFile(secretFile, "utf8");
    return parseSimpleYaml(source);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

function parseSimpleYaml(source: string): {
  bucket?: string;
  region?: string;
  path?: string;
  secretId?: string;
  secretKey?: string;
} {
  const output: Record<string, string> = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf(":");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    output[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }

  return {
    bucket: output.bucket,
    region: output.region,
    path: output.path,
    secretId: output.secretId,
    secretKey: output.secretKey,
  };
}

await main();
