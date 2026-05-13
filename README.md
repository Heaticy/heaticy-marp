# Heaticy-Marp

一个用于生成 Marp PPT 的主题仓库，默认通过腾讯云 COS 提供远程主题和素材。

## 用户说明

如果你只是想在 VS Code 里预览 Marp，只需要下面 4 件事：

1. 安装 `Marp for VS Code` 插件。
2. 当前 VS Code 工作区是 `Trusted Workspace`。
3. VS Code 打开的工作区根目录下有 `.vscode/settings.json`。
4. Markdown 头部包含正确的 Marp 配置。

Markdown 头部最小示例：

```yaml
---
marp: true
theme: tutorial-shtu-red
size: 16:9
---
```

工作区设置：

工作区目录结构至少要像这样：

```text
your-workspace/
  .vscode/
    settings.json
  anywhere.md
```

也就是说，关键是工作区根目录下必须有 `.vscode/settings.json`。Markdown 文件放在这个工作区里的任意位置都可以。

```json
{
  "markdown.marp.html": "all",
  "markdown.marp.themes": [
    "https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/themes/tutorial-shtu-red.css",
    "https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/themes/report-amber.css"
  ]
}
```

现成模板：

- `templates/tutorial.md`
- `templates/tutorial-with-background.md`
- `templates/report.md`

现成工作区配置见 [.vscode/settings.json](/mnt/nas-home/heaticy-marp/.vscode/settings.json:1)。

## CLI 用法

CLI 方式放在 VS Code 方式后面，是因为它更适合自动化：

- agent 可以直接生成 `pdf` 或 `html`
- agent 可以根据渲染结果继续反馈和调节内容、版式和主题
- 但对普通用户来说，这不是必需步骤，单用 VS Code 预览就够了

先安装依赖：

```bash
npm install --ignore-scripts
```

渲染命令：

```bash
node --import tsx scripts/render.ts <input.md> [-o output.html]
node --import tsx scripts/render.ts <input.md> --pdf -o output.pdf
```

常见示例：

```bash
node --import tsx scripts/render.ts templates/tutorial.md -o /tmp/tutorial.html
node --import tsx scripts/render.ts templates/tutorial.md --pdf -o /tmp/tutorial.pdf
node --import tsx scripts/render.ts templates/report.md --theme report-amber -o /tmp/report.html
```

说明：

- 不加 `--pdf` 时，默认输出 `html`
- 加 `--pdf` 时，输出 `pdf`
- `--theme` 可以覆盖 Markdown 头部里的 `theme`

## 开发说明

开发、CLI、COS 发布、主题构建和仓库结构见 [docs/DEVELOPMENT.md](/mnt/nas-home/heaticy-marp/docs/DEVELOPMENT.md:1)。
