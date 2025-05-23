# Cloudflare R2 Setup Guide | Cloudflare R2 设置指南

This guide will help you set up Cloudflare R2 and obtain the necessary credentials for Clip Pub.

本指南将帮助您设置 Cloudflare R2 并获取 Clip Pub 所需的凭证。

## Table of Contents | 目录

- [Register Cloudflare Account | 注册 Cloudflare 账号](#register-cloudflare-account--注册-cloudflare-账号)
- [Access R2 Service | 访问 R2 服务](#access-r2-service--访问-r2-服务)
- [Create R2 Bucket | 创建 R2 存储桶](#create-r2-bucket--创建-r2-存储桶)
- [Get Cloudflare Account ID | 获取 Cloudflare 账户 ID](#get-cloudflare-account-id--获取-cloudflare-账户-id)
- [Create R2 API Keys | 创建 R2 API 密钥](#create-r2-api-keys--创建-r2-api-密钥)
- [Set Up Custom Domain | 设置自定义域名](#set-up-custom-domain--设置自定义域名)

## Register Cloudflare Account | 注册 Cloudflare 账号

### English
1. Visit the [Cloudflare registration page](https://dash.cloudflare.com/sign-up)
2. Enter your email and password, click "Create Account"
3. Verify your email address through the confirmation email
4. Note: You'll need to add billing information to use R2 (no charges within free tier)

### 中文
1. 访问 [Cloudflare 注册页面](https://dash.cloudflare.com/sign-up)
2. 输入邮箱和密码，点击"创建账号"
3. 通过确认邮件验证您的邮箱地址
4. 注意：使用 R2 需要添加账单信息（在免费额度内不会产生费用）

## Access R2 Service | 访问 R2 服务

### English
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to "R2" in the left sidebar (under "Workers & Pages")
3. If prompted, enable R2 service by adding payment information
4. Refresh the page to ensure R2 dashboard is accessible

### 中文
1. 登录 [Cloudflare 仪表板](https://dash.cloudflare.com)
2. 在左侧导航栏找到"R2"选项（位于"Workers & Pages"下）
3. 如需启用 R2 服务，请按提示添加支付信息
4. 刷新页面确保可以访问 R2 仪表板

## Create R2 Bucket | 创建 R2 存储桶

### English
1. Click "Create bucket" in the R2 dashboard
2. Enter a unique bucket name (lowercase letters, numbers, and hyphens)
3. Select storage region (default: "Auto")
4. Click "Create bucket" to confirm
5. Note down your bucket name for Clip Pub configuration

### 中文
1. 在 R2 仪表板中点击"创建存储桶"
2. 输入唯一的存储桶名称（小写字母、数字和短横线）
3. 选择存储区域（默认："自动"）
4. 点击"创建存储桶"确认
5. 记录存储桶名称用于 Clip Pub 配置

## Get Cloudflare Account ID | 获取 Cloudflare 账户 ID

### English
Method 1 - R2 Dashboard:
1. Go to R2 dashboard
2. Find Account ID in the top-right corner
3. Click the copy button next to it

Method 2 - Account Overview:
1. Go to Account Home
2. Click your account name in the top-right
3. Find Account ID in the API section
4. Click "Click to copy"

### 中文
方法 1 - R2 仪表板：
1. 进入 R2 仪表板
2. 在右上角找到账户 ID
3. 点击旁边的复制按钮

方法 2 - 账户概览：
1. 进入账户首页
2. 点击右上角的账户名称
3. 在 API 部分找到账户 ID
4. 点击"点击复制"

## Create R2 API Keys | 创建 R2 API 密钥

### English
1. Go to R2 dashboard
2. Click "Manage R2 API Tokens"
3. Choose token type:
   - Account API Token (recommended)
   - User API Token
4. Set permissions:
   - For Clip Pub: "Object Read and Write"
   - Optionally restrict to specific bucket
5. Create token and save credentials:
   - Access Key ID
   - Secret Access Key (shown only once!)

### 中文
1. 进入 R2 仪表板
2. 点击"管理 R2 API 令牌"
3. 选择令牌类型：
   - 账户 API 令牌（推荐）
   - 用户 API 令牌
4. 设置权限：
   - Clip Pub 需要："对象读写"权限
   - 可选择限制到特定存储桶
5. 创建令牌并保存凭证：
   - 访问密钥 ID
   - 密钥（仅显示一次！）

## Set Up Custom Domain | 设置自定义域名

### English
1. Prerequisites:
   - Domain must be in your Cloudflare account
   - Domain must be active
2. In R2 dashboard:
   - Select your bucket
   - Go to "Settings" tab
   - Find "Public access" section
   - Click "Add" in "Custom Domains"
3. Enter domain (e.g., cdn.example.com)
4. Confirm DNS records
5. Wait for status to become "Active"
6. Test access: https://your-domain.com/filename

### 中文
1. 前提条件：
   - 域名必须在您的 Cloudflare 账户中
   - 域名必须处于激活状态
2. 在 R2 仪表板中：
   - 选择您的存储桶
   - 进入"设置"选项卡
   - 找到"公共访问"部分
   - 点击"自定义域"中的"添加"
3. 输入域名（例如：cdn.example.com）
4. 确认 DNS 记录
5. 等待状态变为"活跃"
6. 测试访问：https://your-domain.com/filename

## Required Parameters for Clip Pub | Clip Pub 所需参数

### English
After completing the setup, you'll have:
- R2 Bucket Name
- Cloudflare Account ID
- Access Key ID
- Secret Access Key
- Custom Domain URL (e.g., https://cdn.example.com)

Use these parameters when running `clippub configure`

### 中文
完成设置后，您将获得：
- R2 存储桶名称
- Cloudflare 账户 ID
- 访问密钥 ID
- 密钥
- 自定义域名 URL（例如：https://cdn.example.com）

运行 `clippub configure` 时使用这些参数

## References | 参考资料

- [Getting Started with R2](https://developers.cloudflare.com/r2/get-started/)
- [Find Account ID](https://developers.cloudflare.com/fundamentals/get-started/basic-tasks/find-account-and-zone-ids/)
- [R2 API Tokens](https://developers.cloudflare.com/r2/api/s3/tokens/)
- [Public Buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/) 