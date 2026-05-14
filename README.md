# Heaticy-Marp

一个用于生成 Marp PPT 的主题仓库，默认通过腾讯云 COS 提供远程主题和素材。

## 用户说明

如果你只是想在 VS Code 里预览 Marp，只需要下面几件事：

1. 安装 `Marp for VS Code` 插件。
2. 当前 VS Code 工作区是 `Trusted Workspace`。
3. 在 VS Code 用户级设置里加载远程主题。
4. Markdown 头部包含正确的 Marp 配置；推荐直接参考或复制本仓库 `templates/` 里的现成模板。

Markdown 头部最小示例：

```yaml
---
marp: true
theme: tutorial-shtu-red
size: 16:9
---
```

直接使用用户级设置即可，不需要在项目里放 `.vscode/settings.json`。打开 VS Code 设置，搜索 `marp`，在用户设置里把 `Markdown > Marp: HTML` 改成 `all`，并在 `Markdown > Marp: Themes` 添加这两个远程主题：

```text
https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/themes/tutorial-shtu-red.css
https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/themes/report-amber.css
```

这样配置后，换目录打开 Markdown 也能预览；如果 VS Code 的工作区配置偶发失效，用户级配置也可以作为稳定 fallback。

使用用户级设置时，Markdown 文件放在哪里都可以，不需要固定工作区结构。

示意图：

![打开 VS Code 用户设置](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/assets/docs/vscode-marp-user-settings-step1.png)

![配置 Marp HTML 和远程主题](https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com/markdown/heaticy-marp/assets/docs/vscode-marp-user-settings-step2.png)

### 仅在使用工作区配置时

仓库里的 `.vscode/settings.json` 只是现成示例，适合需要把配置随项目带走的情况；普通使用不需要它。

如果你确实要使用工作区配置，需要保证 `.vscode/settings.json` 位于 VS Code 打开的工作区根目录下。例如：

```text
your-workspace/
  .vscode/
    settings.json
  anywhere.md
```

Markdown 文件放在这个工作区里的任意位置都可以。

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
