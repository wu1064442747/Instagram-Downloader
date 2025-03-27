# Instagram Downloader - FastDL.space

![FastDL.space](img/logo.png)

一个功能强大的Instagram内容下载工具，支持下载视频、照片、Reels、Stories、音频等内容。

## 特点

- 🚀 快速下载Instagram视频、照片、Reels、Stories和音频
- 📱 支持高清(HD)和超高清(4K)视频下载
- 📥 批量下载功能，一次处理多个链接
- 🌐 支持多语言界面（中文、英文）
- 🔒 支持下载自己账号的私密内容
- 🔄 持续更新以适应Instagram API变化
- ☁️ 基于Cloudflare Workers的无服务器后端

## 在线使用

访问我们的网站：[FastDL.space](https://fastdl.space)

## 架构设计

整个应用由两部分组成：

1. **前端**：纯静态HTML/CSS/JavaScript网站，可部署在GitHub Pages或任何静态网站托管服务
2. **后端**：Cloudflare Worker无服务器函数，负责处理Instagram内容的提取和下载

### 技术栈

- **前端**：HTML5, CSS3, 原生JavaScript（无框架依赖）
- **后端**：Cloudflare Workers (JavaScript)
- **部署**：GitHub Pages + Cloudflare

## 本地部署

### 前提条件

- Web服务器（如Nginx、Apache等）
- 或者使用GitHub Pages + Cloudflare部署
- Cloudflare账户（用于部署Worker后端）

### 前端安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/fastdl-space/instagram-downloader.git
   cd instagram-downloader
   ```

2. 配置Web服务器指向项目根目录

3. 访问 `http://localhost` 或您的域名

### 后端部署

1. 创建Cloudflare Worker
   - 登录Cloudflare Dashboard
   - 进入Workers & Pages
   - 创建新Worker
   - 粘贴`worker.js`内容

2. 配置Worker路由（可选）
   - 添加自定义域名，如`instagram-dl.fastdl.space`
   - 配置DNS设置

3. 更新前端代码中的API端点
   - 修改`js/main.js`中的`API_ENDPOINT`变量，指向您的Worker URL

完整部署指南请参见 [DEPLOY.md](DEPLOY.md)

## 使用方法

1. 在Instagram应用或网页上复制链接
2. 将链接粘贴到FastDL.space下载框中
3. 点击下载按钮获取内容

## 批量下载

1. 准备多个Instagram链接，每行一个
2. 粘贴到批量下载文本框中
3. 点击"批量下载"按钮
4. 选择保存位置即可

## 后端API

Worker提供以下API端点：

- `POST /`
  - 请求体: `{ "url": "https://www.instagram.com/p/..." }`
  - 响应: `{ "success": true, "type": "Video", "url": "...", "thumbnail": "...", "title": "...", "size": "..." }`

## 贡献

欢迎通过以下方式贡献：

1. Fork该项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 注意事项

- Instagram API可能随时变化，可能需要更新Worker脚本中的提取逻辑
- 某些内容（如Stories）可能需要登录才能访问
- 请遵守当地法律法规和Instagram服务条款使用本工具

## 许可证

此项目采用MIT许可证 - 详情请参见 [LICENSE](LICENSE) 文件

## 免责声明

FastDL.space是一个独立自主开发的应用和网站，不隶属于Instagram或Meta。我们的工具旨在帮助用户下载自己账户上传的内容，请遵守当地法律法规和Instagram的服务条款使用本工具。

## 联系我们

- 电子邮件: support@fastdl.space
- GitHub: [github.com/fastdl-space](https://github.com/fastdl-space)
- 网站: [FastDL.space](https://fastdl.space) 