# Instagram Downloader API

这是一个强大的Instagram内容下载API服务，支持下载视频、图片、Reels、故事和音频等多种内容。

## 主要功能

- 支持多种Instagram内容下载：视频、图片、Reels、故事
- 支持批量下载多个链接
- 支持不同视频质量选择（最高质量、高清、标清）
- 支持提取音频为MP3格式
- 智能缓存机制提高性能
- 自动清理临时文件
- 支持私密内容检测
- 内置速率限制保护服务器

## 技术栈

- Node.js
- Express
- yt-dlp (需要单独安装)
- 其他依赖：axios, cheerio, node-cache, archiver等

## 安装

### 前置条件

- Node.js >= 16.0.0
- [yt-dlp](https://github.com/yt-dlp/yt-dlp#installation) (需要安装在系统路径中)

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/instagram-downloader-api.git
cd instagram-downloader-api
```

2. 安装依赖

```bash
npm install
```

3. 安装yt-dlp

根据您的操作系统，按照[yt-dlp安装指南](https://github.com/yt-dlp/yt-dlp#installation)进行安装。

例如，在Linux/macOS上：
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

在Windows上：
- 下载[yt-dlp.exe](https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe)
- 将其放在PATH环境变量包含的目录中

4. 启动服务器

```bash
npm start
```

开发模式（自动重启）：
```bash
npm run dev
```

## API使用说明

### 获取缩略图

```
GET /api/thumbnail?url={instagram_url}
```

参数：
- `url`: Instagram链接

返回值：
```json
{
  "success": true,
  "thumbnail": "https://example.com/image.jpg"
}
```

### 下载单个内容

```
GET /api/download?url={instagram_url}&quality={quality}&format={format}
```

参数：
- `url`: Instagram链接（必填）
- `quality`: 视频质量（可选，默认为"highest"）
  - `highest`: 最高质量
  - `hd`: 高清 (720p)
  - `sd`: 标清
- `format`: 输出格式（可选，默认为"original"）
  - `original`: 原始格式
  - `mp4`: MP4视频
  - `mp3`: MP3音频

返回值：
- 成功时：直接返回下载的文件
- 失败时：
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 批量下载

```
POST /api/batch-download
```

请求体：
```json
{
  "urls": ["url1", "url2", "url3"],
  "quality": "highest",
  "format": "original"
}
```

参数：
- `urls`: Instagram链接数组（必填，最多10个）
- `quality`: 同上
- `format`: 同上

返回值：
- 成功时：返回ZIP文件（包含所有下载内容）
- 部分成功时：返回ZIP文件（包含所有成功下载的内容）
- 全部失败时：
```json
{
  "success": false,
  "error": "所有下载均失败",
  "details": [
    {"url": "url1", "success": false, "error": "错误原因"}
  ]
}
```

## 前端集成

在您的前端代码中，可以使用以下方式调用API：

```javascript
// 单个下载示例
const downloadUrl = `https://your-api-domain.com/api/download?url=${encodeURIComponent(instagramUrl)}&quality=highest&format=mp4`;
window.location.href = downloadUrl;

// 或者用fetch API批量下载
async function batchDownload(urls) {
  try {
    const response = await fetch('https://your-api-domain.com/api/batch-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: urls,
        quality: 'highest',
        format: 'original'
      }),
    });
    
    if (response.ok) {
      // 处理文件下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'instagram_downloads.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      const errorData = await response.json();
      console.error('下载失败:', errorData.error);
    }
  } catch (error) {
    console.error('请求错误:', error);
  }
}
```

## 部署

### Docker部署

1. 创建Dockerfile：

```dockerfile
FROM node:16-alpine

# 安装yt-dlp和其依赖
RUN apk add --no-cache python3 py3-pip ffmpeg curl
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

2. 构建并运行Docker镜像：

```bash
docker build -t instagram-downloader-api .
docker run -p 3000:3000 instagram-downloader-api
```

### 服务器环境变量

您可以通过环境变量自定义服务器行为：

- `PORT`: 服务器端口（默认：3000）
- `NODE_ENV`: 环境模式（development或production）

## 许可证

MIT 