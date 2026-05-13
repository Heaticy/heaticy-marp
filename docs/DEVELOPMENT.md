# Development

## CLI 用法

CLI 更适合自动化流程，例如 agent 连续生成 `html` / `pdf`，再根据结果继续调整内容和版式。普通用户如果只需要预览，优先用 VS Code 即可。

先安装依赖：

```bash
npm install --ignore-scripts
```

渲染入口：

```bash
node --import tsx scripts/render.ts <input.md> [--theme <name>] [--pdf] [-o output.html]
```

输出规则：

- 默认输出 `html`
- 加 `--pdf` 时输出 `pdf`
- `-o` 用来指定输出文件名

示例：

```bash
node --import tsx scripts/render.ts templates/tutorial.md -o /tmp/tutorial.html
node --import tsx scripts/render.ts templates/report.md --theme report-amber -o /tmp/report.html
node --import tsx scripts/render.ts templates/tutorial.md --pdf -o /tmp/tutorial.pdf
```

行为：

- 优先读取命令行 `--theme`
- 否则读取 Markdown frontmatter 里的 `theme`
- 否则回退到 `tutorial-shtu-red`
- 按主题名从 COS 下载远程 CSS 到 `.marp-cache/themes/`
- 用本地缓存文件调用 `marp-cli`

## 本地主题开发

如果你要修改 `themes/**/*.scss`，先安装依赖，再构建本地 CSS：

```bash
npm install --ignore-scripts
node --import tsx scripts/build-themes.ts
```

主题 preset 需要包含：

- `/* @theme <name> */`
- `/* @size 16:9 1280px 720px */`
- `/* @size 4:3 960px 720px */`

## 发布到 COS

本地可用 `secret.yaml` 或环境变量提供凭据，优先读取 `secret.yaml`。

`secret.yaml` 示例：

```yaml
bucket: heaticy-1310163554
region: ap-shanghai
path: markdown/heaticy-marp
secretId: <your-secret-id>
secretKey: <your-secret-key>
```

上传命令：

```bash
node --import tsx scripts/sync-cos.ts
```

## 仓库结构

- `themes/`: 主题源码
- `templates/`: 直接可用的 PPT 模板
- `shared-assets/`: 背景和 logo 素材
- `scripts/build-themes.ts`: 构建主题 CSS
- `scripts/render.ts`: 远程主题 CLI 渲染入口
- `scripts/sync-cos.ts`: 上传主题与素材到 COS

## Fork 声明

本仓库基于 `Hypo-Marp` fork 并重组，主要变化：

- 仓库名称改为 `Heaticy-Marp`
- 删除旧的 review、examples、tests 和历史说明材料
- 新人入口统一改为 `templates/`
- 主题 CSS 和图片素材统一发布到腾讯云 COS
- 日常使用收敛为 VS Code 预览和 CLI 渲染两条链路
