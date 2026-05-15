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

## VS Code 用户级 Marp 配置

不想在每个项目里放 `.vscode/settings.json` 时，可以直接使用 VS Code 用户级设置。它对所有工作区生效，也可以作为 VS Code 工作区配置异常时的 fallback。

步骤：

1. 打开 `文件 > 首选项 > 设置`。
2. 搜索 `marp`，切到 `用户` 设置。
3. 把 `Markdown > Marp: HTML` 改成 `all`。
4. 在 `Markdown > Marp: Themes` 添加远程主题 CSS：

```text
https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/themes/tutorial-shtu-red.css
https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/themes/report-amber.css
```

示意图：

![打开 VS Code 用户设置](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/assets/docs/vscode-marp-user-settings-step1.png)

![配置 Marp HTML 和远程主题](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/assets/docs/vscode-marp-user-settings-step2.png)

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

## 字体候选规则

主题字体由 palette 里的 CSS 变量控制，目前 `shtu-red` 和 `amber` 使用同一组候选顺序：

- `--font-family-display`: 标题、封面和强调标题。
- `--font-family-body`: 正文。
- `--font-family-mono`: 行内代码和代码块。
- `--font-family-accent`: 页脚和装饰性文字。

候选字体不是按平台分支判断，而是浏览器 / Marp 按从左到右匹配。Latin Modern 不视为系统默认字体，标题、正文和代码优先使用 `Heaticy Latin Modern ...` 字体；对应 `@font-face` 会先尝试本机 Latin Modern，再回退到 COS 上的小体积 OTF。中文字体只声明 local-only 的 `Heaticy Noto ...` 字体别名，不再通过主题 CSS 从 COS 远程加载；PDF 渲染时如果本机能识别 Heaticy/Noto CJK 就优先使用，否则自然落到系统 fallback，避免下载大体积中文字体导致超时。当前完整 fallback 链如下：

| 用途 | fallback 链 |
| --- | --- |
| 标题 | `Heaticy Latin Modern Sans` -> `Heaticy Noto Sans CJK SC` -> `Noto Sans CJK SC` -> `sans-serif` |
| 正文 | `Heaticy Latin Modern Roman` -> `Heaticy Noto Serif CJK SC` -> `Noto Serif CJK SC` -> `serif` |
| 代码 | `Heaticy Latin Modern Mono` -> `Ubuntu Mono` -> `DejaVu Sans Mono` -> `Liberation Mono` -> `Heaticy Noto Sans Mono CJK SC` -> `Noto Sans Mono CJK SC` -> `monospace` |
| 装饰 | `Heaticy Latin Modern Sans` -> `Heaticy Noto Sans CJK SC` -> `Noto Sans CJK SC` -> `sans-serif` |

如果需要改变跨平台字体策略，优先修改 `themes/palettes/*.scss` 里的四个 `--font-family-*` 变量，并同步检查两个 palette，避免同一主题族在不同颜色预设下字体不一致。

### Windows 安装本仓库字体

Windows 机器如果没有安装本仓库字体，主题仍可正常渲染 PDF，并会落到系统中文 fallback；但不同机器的中英文字形可能不完全一致。需要稳定复现模板效果，或需要让 `Heaticy Latin Modern ...` 和 `Heaticy Noto ...` 的 local-only 字体声明命中本机字体时，运行仓库里的用户级安装脚本：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows-fonts.ps1
```

脚本会从 COS 下载 Latin Modern 和 Noto Serif/Sans/Sans Mono CJK SC 的 Regular/Bold OTF 到 `.marp-cache/fonts/` 下的分组缓存目录，再安装到当前用户字体目录 `%LOCALAPPDATA%\Microsoft\Windows\Fonts`。默认会跳过已下载或已安装的字体；需要重新下载并覆盖安装时加 `-Force`：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows-fonts.ps1 -Force
```

当前脚本优先使用当前用户字体安装方案，通常不需要管理员权限。安装后请重启已经打开的 VS Code、浏览器或终端，再重新渲染 PDF。

## GitLab CI

GitLab CI 使用 `latex-runner` 标签匹配当前可用的 shared runner。runner 不接收 untagged jobs，因此新增 job 时需要保留这个标签配置。

CI 会在 push、merge request、tag 和网页手动触发时创建流水线。普通开发提交只做轻量检查和构建；COS 发布仍使用本地 `sync:cos` 命令，不会在普通 push 中自动执行。

流水线包含：

- `check`: 运行 `npm run check`，构建主题 CSS 作为标准检查。
- `build`: 运行 `npm run build`，并保存 `dist/` 作为一周有效的 artifact。

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
