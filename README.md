# Clip Pub 📋

A command-line tool that quickly publishes clipboard content to a public URL using Cloudflare R2.

English | [中文](#clip-pub-中文-)

## Features ✨

- 🔄 Publish clipboard content (text, files) to a public URL instantly
- 📁 Support for various content types:
  - Plain text
  - HTML content
  - Files (up to 10MB)
- 🔒 Secure configuration management
- 🎯 Cross-platform support (macOS, Linux, Windows)
- 📋 Automatic URL copying to clipboard
- 🚀 Fast and efficient uploads using Cloudflare R2

## Prerequisites 📋

- [Deno](https://deno.land/) (v2.3.0 or later)
- Cloudflare R2 account with:
  - R2 bucket
  - Access Key ID and Secret Access Key
  - Custom domain (optional but recommended)

## Installation 💻

```bash
# Clone the repository
git clone https://github.com/yourusername/clip-pub.git
cd clip-pub

# Install globally (optional)
deno install --global --allow-all -f --name clippub main.ts
```

## Configuration ⚙️

Before using Clip Pub, you need to configure your Cloudflare R2 credentials:

```bash
clippub configure
```

You'll be prompted to enter:
- Cloudflare R2 Bucket Name
- Cloudflare Account ID
- Cloudflare Access Key ID
- Cloudflare Secret Access Key
- R2 Public Custom Domain URL (e.g., https://cdn.example.com)

Configuration is stored securely in `~/.config/clippub/config.json`.

## Usage 🚀

### Basic Usage

```bash
# Publish clipboard content
clippub publish

# Publish with custom filename (for text content)
clippub publish --name custom-filename.txt
```

### Commands

- `configure` - Set up Cloudflare R2 credentials
- `publish` - Publish clipboard content
- `help` - Show help message

### Examples

1. Copy text to clipboard and publish:
   ```bash
   # Copy some text to clipboard
   echo "Hello, World!" | pbcopy  # macOS
   # or
   echo "Hello, World!" | xclip -selection clipboard  # Linux
   # or
   echo "Hello, World!" | clip  # Windows
   
   # Publish
   clippub publish
   ```

2. Copy a file to clipboard and publish:
   ```bash
   # On macOS, copy a file in Finder
   # Then run:
   clippub publish
   ```

## Development 🛠️

```bash
# Run in development mode with watch
deno task dev

# Run specific command
deno run --allow-all main.ts publish
```

## Project Structure 📁

```
clip-pub/
├── main.ts           # Main entry point
├── src/
│   ├── config.ts     # Configuration management
│   ├── clipboard.ts  # Clipboard operations
│   ├── r2.ts         # Cloudflare R2 integration
│   └── utils.ts      # Utility functions
├── deno.json         # Deno configuration
└── README.md         # This file
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

MIT License - see the [LICENSE](LICENSE) file for details.

---

# Clip Pub 中文 📋

一个使用 Cloudflare R2 快速将剪贴板内容发布到公共 URL 的命令行工具。

## 功能特点 ✨

- 🔄 即时将剪贴板内容（文本、文件）发布到公共 URL
- 📁 支持多种内容类型：
  - 纯文本
  - HTML 内容
  - 文件（最大 10MB）
- 🔒 安全的配置管理
- 🎯 跨平台支持（macOS、Linux、Windows）
- 📋 自动将 URL 复制到剪贴板
- 🚀 使用 Cloudflare R2 实现快速高效的上传

## 前置要求 📋

- [Deno](https://deno.land/)（v2.3.0 或更高版本）
- Cloudflare R2 账户，需要：
  - R2 存储桶
  - 访问密钥 ID 和密钥
  - 自定义域名（可选但推荐）

## 安装 💻

```bash
# 克隆仓库
git clone https://github.com/yourusername/clip-pub.git
cd clip-pub

# 全局安装（可选）
deno install --allow-all --name clippub main.ts
```

## 配置 ⚙️

使用 Clip Pub 之前，需要配置 Cloudflare R2 凭证：

```bash
clippub configure
```

需要输入以下信息：
- Cloudflare R2 存储桶名称
- Cloudflare 账户 ID
- Cloudflare 访问密钥 ID
- Cloudflare 密钥
- R2 公共自定义域名 URL（例如：https://cdn.example.com）

配置信息安全存储在 `~/.config/clippub/config.json` 中。

## 使用方法 🚀

### 基本使用

```bash
# 发布剪贴板内容
clippub publish

# 使用自定义文件名发布（主要用于文本内容）
clippub publish --name custom-filename.txt
```

### 命令

- `configure` - 设置 Cloudflare R2 凭证
- `publish` - 发布剪贴板内容
- `help` - 显示帮助信息

### 示例

1. 复制文本到剪贴板并发布：
   ```bash
   # 复制文本到剪贴板
   echo "你好，世界！" | pbcopy  # macOS
   # 或
   echo "你好，世界！" | xclip -selection clipboard  # Linux
   # 或
   echo "你好，世界！" | clip  # Windows
   
   # 发布
   clippub publish
   ```

2. 复制文件到剪贴板并发布：
   ```bash
   # 在 macOS 的 Finder 中复制文件
   # 然后运行：
   clippub publish
   ```

## 开发 🛠️

```bash
# 以开发模式运行（带监视）
deno task dev

# 运行特定命令
deno run --allow-all main.ts publish
```

## 项目结构 📁

```
clip-pub/
├── main.ts           # 主入口文件
├── src/
│   ├── config.ts     # 配置管理
│   ├── clipboard.ts  # 剪贴板操作
│   ├── r2.ts         # Cloudflare R2 集成
│   └── utils.ts      # 工具函数
├── deno.json         # Deno 配置
└── README.md         # 本文档
```

## 贡献 🤝

欢迎贡献代码！请随时提交 Pull Request。

## 许可证 📄

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。 
