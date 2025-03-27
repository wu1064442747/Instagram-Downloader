# Instagram 下载器

一个功能强大的Instagram内容下载工具，支持下载视频、图片、Reels、故事等内容。

## 在线演示

访问 [https://f3e3cb81.instagram-downloader-ew4.pages.dev](https://f3e3cb81.instagram-downloader-ew4.pages.dev) 体验在线版本。

## 功能特点

- ✅ 批量下载Instagram内容
- ✅ 支持下载视频、照片、Reels、故事
- ✅ 高清视频下载支持
- ✅ 可提取音频
- ✅ 无需登录Instagram账号
- ✅ 响应式设计，移动设备友好
- ✅ 多语言支持（中文、英文）

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Node.js, Cloudflare Workers/Pages Functions
- 部署：Cloudflare Pages

## 本地开发

### 前提条件

- Node.js (版本 14+)
- npm 或 yarn

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/你的用户名/instagram-downloader.git
   cd instagram-downloader
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 运行开发服务器
   ```bash
   npm run dev
   ```

4. 访问 `http://localhost:8787` 查看网站

## 部署

### 使用Cloudflare Pages部署

1. 安装Wrangler CLI
   ```bash
   npm install -g wrangler
   ```

2. 登录Cloudflare
   ```bash
   wrangler login
   ```

3. 部署到Cloudflare Pages
   ```bash
   npm run deploy
   ```

### 使用Docker部署

1. 构建Docker镜像
   ```bash
   docker build -t instagram-downloader .
   ```

2. 运行容器
   ```bash
   docker run -p 3000:3000 instagram-downloader
   ```

3. 访问 `http://localhost:3000` 查看网站

## 项目结构

```
├── public/                # 静态资源目录
│   ├── css/               # CSS样式文件
│   ├── js/                # JavaScript文件
│   ├── img/               # 图片资源
│   └── index.html         # 中文版主页
├── functions/             # Cloudflare Pages Functions
│   └── api/               # API处理函数
│       └── [[route]].js   # API路由处理
├── css/                   # 源CSS文件
├── js/                    # 源JavaScript文件
├── img/                   # 源图片文件
├── cloudflare-worker.js   # Cloudflare Worker脚本
├── server.js              # Node.js服务器脚本
├── wrangler.toml          # Wrangler配置文件
├── Dockerfile             # Docker配置文件
├── docker-compose.yml     # Docker Compose配置
├── package.json           # 项目依赖配置
└── README.md              # 项目说明文档
```

## API参考

### 获取缩略图

```
GET /api/thumbnail?url={instagram_url}
```

### 下载内容

```
GET /api/download?url={instagram_url}&quality={quality}&format={format}
```

参数说明：
- `quality`: 视频质量，可选值为`highest`, `hd`, `sd`
- `format`: 输出格式，可选值为`original`, `mp4`, `mp3`

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加了一个很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 详情请查看[LICENSE](LICENSE)文件

## 免责声明

本工具仅用于学习和研究目的，请用户遵守Instagram的服务条款，不要下载和分享未经授权的内容。开发者对用户的行为不承担任何责任。 