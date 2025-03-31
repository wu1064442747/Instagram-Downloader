# Instagram Downloader

一个功能强大的Instagram内容下载器，支持视频、短视频、故事和图片下载。

## 功能特点

- 支持多种内容类型下载:
  - Instagram视频
  - Instagram短视频
  - Instagram故事
  - Instagram图片
- 批量下载支持
- 高质量下载(HD/4K)
- 中英文界面
- 无需注册
- 快速下载

## 技术栈

- Next.js
- React
- TypeScript
- TailwindCSS
- Puppeteer
- Redis
- FFmpeg

## 安装

1. 克隆仓库:
```bash
git clone https://github.com/yourusername/instagram-downloader.git
cd instagram-downloader
```

2. 安装依赖:
```bash
npm install
```

3. 配置环境变量:
创建`.env.local`文件并添加以下内容:
```
REDIS_URL=your_redis_url
```

4. 运行开发服务器:
```bash
npm run dev
```

## 部署

1. 构建项目:
```bash
npm run build
```

2. 启动生产服务器:
```bash
npm start
```

## 使用方法

1. 复制Instagram内容链接
2. 粘贴到下载器输入框
3. 点击下载按钮
4. 等待下载完成

## 注意事项

- 请确保您有权限下载相关内容
- 下载速度取决于网络状况
- 部分内容可能需要登录才能下载

## 许可证

MIT 