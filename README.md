# FastDL.space - Instagram 内容下载器

FastDL.space 是一个功能强大的 Instagram 内容下载工具，支持视频、照片、Reels、Stories、音频和私密内容下载。支持中英文双语界面，并且具有批量下载功能。

## 功能特性

- ✅ 下载 Instagram 视频（MP4、高清、4K）
- ✅ 下载 Instagram 照片（原始质量）
- ✅ 下载 Instagram Reels 短视频
- ✅ 下载 Instagram Stories 故事
- ✅ 从视频中提取音频（MP3、M4A）
- ✅ 下载私密账号内容（需授权）
- ✅ 批量下载功能
- ✅ 中英文界面切换
- ✅ 无需安装额外软件
- ✅ 完全免费使用

## 技术实现

项目使用以下技术栈构建：

- **前端**：HTML5, CSS3, JavaScript（原生）
- **后端**：Node.js, Express
- **数据提取**：Axios, Cheerio
- **媒体处理**：ffmpeg, ytdl-core
- **Instagram API**：instagram-private-api

## 安装说明

要在本地运行此项目，请按照以下步骤操作：

### 前提条件

- Node.js (v14.0.0 或更高版本)
- npm 或 yarn
- FFmpeg（用于音频提取功能）

### 安装步骤

1. 克隆此仓库：

```bash
git clone https://github.com/yourusername/instagram-downloader.git
cd instagram-downloader
```

2. 安装依赖：

```bash
npm install
# 或使用 yarn
yarn install
```

3. 安装 FFmpeg（如果尚未安装）：

**Windows**：
- 下载 FFmpeg 静态构建版本：https://ffmpeg.org/download.html
- 将 FFmpeg 添加到系统 PATH

**macOS**：
```bash
brew install ffmpeg
```

**Linux**：
```bash
sudo apt update
sudo apt install ffmpeg
```

4. 创建 `downloads` 目录：

```bash
mkdir downloads
```

5. 启动服务器：

```bash
npm start
# 或使用开发模式
npm run dev
```

6. 在浏览器中访问：

```
http://localhost:3000
```

## 使用说明

### 下载视频

1. 在 Instagram 上找到要下载的视频帖子
2. 点击右上角的 "..." 并选择 "复制链接"
3. 在 FastDL.space 网站上粘贴链接
4. 选择所需的视频质量（可选）
5. 点击 "下载视频" 按钮
6. 等待处理完成后点击下载链接

### 下载 Reels

1. 在 Instagram 上找到要下载的 Reels
2. 点击右上角的 "..." 并选择 "复制链接"
3. 在 FastDL.space 网站上粘贴链接
4. 点击 "下载 Reels" 按钮
5. 等待处理完成后点击下载链接

### 下载 Stories

1. 在 Instagram 上查看要下载的 Story
2. 点击 "..." 并选择 "复制链接"
3. 在 FastDL.space 网站上粘贴链接
4. 点击 "下载 Stories" 按钮
5. 等待处理完成后点击下载链接

### 批量下载

1. 收集多个 Instagram 链接
2. 在批量下载区域中，每行粘贴一个链接
3. 点击 "批量下载" 按钮
4. 等待处理完成后，可以单个下载或点击 "下载全部"

## API 参考

FastDL.space 也提供了 API 接口，可以集成到其他应用中：

### 下载内容

```
POST /api/download
Content-Type: application/json

{
  "url": "https://www.instagram.com/p/XXXX",
  "type": "auto",  // 可选：auto, video, photo, reels, story
  "quality": "auto" // 可选：auto, standard, hd, 4k
}
```

### 提取音频

```
POST /api/extract-audio
Content-Type: application/json

{
  "url": "https://www.instagram.com/p/XXXX",
  "format": "mp3" // 可选：mp3, m4a
}
```

### 批量下载

```
POST /api/batch-download
Content-Type: application/json

{
  "urls": [
    "https://www.instagram.com/p/XXXX",
    "https://www.instagram.com/p/YYYY",
    "https://www.instagram.com/p/ZZZZ"
  ]
}
```

## 注意事项

- 本工具仅用于下载您自己的 Instagram 内容
- 私密账号内容下载需要 Instagram 授权
- 我们不会储存您的 Instagram 账号信息
- 下载的文件会自动在 24 小时后删除
- 使用此工具时请遵守 Instagram 的服务条款

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 联系我们

如有问题或建议，请联系：contact@fastdl.space 