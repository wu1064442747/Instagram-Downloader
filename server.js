const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(morgan('combined')); // 日志记录
app.use(helmet()); // 安全HTTP头

// 创建缓存实例(TTL: 3小时)
const cache = new NodeCache({ stdTTL: 10800, checkperiod: 120 });

// 设置速率限制 - 每IP每小时200请求
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 200, // 限制每IP 200请求/每窗口期
  standardHeaders: true,
  legacyHeaders: false,
  message: '请求过于频繁，请稍后再试'
});

// 应用速率限制到所有API路由
app.use('/api/', limiter);

// 创建下载目录
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// 辅助函数：生成文件名
function generateFilename(url, format = 'mp4') {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  return `${hash}.${format}`;
}

// 辅助函数：检查URL是否有效
function isValidInstagramUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('instagram.com') && 
           (url.includes('/p/') || 
            url.includes('/reel/') || 
            url.includes('/stories/') || 
            url.includes('/tv/'));
  } catch (error) {
    return false;
  }
}

// 辅助函数：获取Instagram类型
function getInstagramType(url) {
  if (url.includes('/reel/')) return 'reels';
  if (url.includes('/stories/')) return 'story';
  if (url.includes('/tv/')) return 'video';
  if (url.includes('/p/')) return 'post';
  return 'unknown';
}

// 使用youtube-dl下载Instagram内容
function downloadWithYoutubeDL(url, quality, format, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      url,
      '-f', quality === 'highest' ? 'bestvideo+bestaudio/best' : 
           quality === 'hd' ? 'bestvideo[height<=720]+bestaudio/best[height<=720]' : 
           'worstvideo+worstaudio/worst',
      '-o', outputPath
    ];

    // 如果只需要音频
    if (format === 'mp3') {
      args.push('-x', '--audio-format', 'mp3');
    }

    const process = spawn('yt-dlp', args);
    
    let stdoutData = '';
    let stderrData = '';

    process.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, filePath: outputPath });
      } else {
        reject({ success: false, error: stderrData || 'Download failed' });
      }
    });
  });
}

// 获取缩略图
async function getThumbnail(url) {
  try {
    const cacheKey = `thumbnail_${url}`;
    const cachedThumbnail = cache.get(cacheKey);
    
    if (cachedThumbnail) {
      return cachedThumbnail;
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // 尝试获取元标签中的图片
    let thumbnail = $('meta[property="og:image"]').attr('content');
    
    if (!thumbnail) {
      // 尝试其他选择器
      thumbnail = $('meta[name="twitter:image"]').attr('content') || 
                 $('img[class*="FFVAD"]').attr('src') ||
                 '/img/default-thumbnail.jpg'; // 默认图片
    }
    
    // 缓存结果
    cache.set(cacheKey, thumbnail);
    return thumbnail;

  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return '/img/default-thumbnail.jpg';
  }
}

// 检查是否为私密账号内容
async function isPrivateContent(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // 检查是否存在私密账号标记
    return $('body').text().includes('This Account is Private') || 
           $('body').text().includes('此帐户已设为私密');
  } catch (error) {
    return false;
  }
}

// API路由：获取缩略图
app.get('/api/thumbnail', async (req, res) => {
  try {
    const url = req.query.url;
    
    if (!url || !isValidInstagramUrl(url)) {
      return res.status(400).json({ success: false, error: '无效的Instagram URL' });
    }
    
    const thumbnail = await getThumbnail(url);
    res.json({ success: true, thumbnail });
  } catch (error) {
    console.error('Thumbnail error:', error);
    res.status(500).json({ success: false, error: '获取缩略图失败' });
  }
});

// API路由：下载内容
app.get('/api/download', async (req, res) => {
  try {
    const { url, quality = 'highest', format = 'original' } = req.query;
    
    if (!url || !isValidInstagramUrl(url)) {
      return res.status(400).json({ success: false, error: '无效的Instagram URL' });
    }
    
    // 检查是否为私密内容
    if (await isPrivateContent(url)) {
      return res.status(403).json({ 
        success: false, 
        error: '此内容来自私密账号，无法下载',
        requiresAuth: true
      });
    }
    
    // 生成缓存键
    const cacheKey = `download_${url}_${quality}_${format}`;
    
    // 检查缓存
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.download(cachedResult.filePath, cachedResult.fileName);
    }
    
    // 确定输出格式
    const outputFormat = format === 'original' ? 
                          (url.includes('/image') ? 'jpg' : 'mp4') : 
                          format;
    
    // 生成文件名和路径
    const fileName = generateFilename(url, outputFormat);
    const filePath = path.join(downloadsDir, fileName);
    
    // 下载内容
    const result = await downloadWithYoutubeDL(url, quality, format, filePath);
    
    if (result.success) {
      // 缓存结果
      cache.set(cacheKey, { filePath, fileName });
      
      // 发送文件
      res.download(filePath, fileName);
      
      // 设置清理定时器 (24小时后删除文件)
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 24 * 60 * 60 * 1000);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '下载失败，请稍后再试'
    });
  }
});

// API路由：批量下载
app.post('/api/batch-download', async (req, res) => {
  try {
    const { urls, quality = 'highest', format = 'original' } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, error: '请提供有效的URL列表' });
    }
    
    if (urls.length > 10) {
      return res.status(400).json({ success: false, error: '每次最多批量下载10个链接' });
    }
    
    const results = [];
    const zipFileName = `instagram_batch_${Date.now()}.zip`;
    const zipFilePath = path.join(downloadsDir, zipFileName);
    
    // 创建一个包含所有下载任务的Promise数组
    const downloadPromises = urls.map(async (url, index) => {
      try {
        if (!isValidInstagramUrl(url)) {
          return { url, success: false, error: '无效的Instagram URL' };
        }
        
        if (await isPrivateContent(url)) {
          return { url, success: false, error: '私密账号内容' };
        }
        
        const outputFormat = format === 'original' ? 
                            (url.includes('/image') ? 'jpg' : 'mp4') : 
                            format;
        
        const fileName = `${index + 1}_${generateFilename(url, outputFormat)}`;
        const filePath = path.join(downloadsDir, fileName);
        
        const result = await downloadWithYoutubeDL(url, quality, format, filePath);
        return { url, success: result.success, filePath, fileName };
      } catch (error) {
        return { url, success: false, error: error.message || '下载失败' };
      }
    });
    
    // 等待所有下载完成
    const downloadResults = await Promise.all(downloadPromises);
    
    // 筛选成功的下载
    const successfulDownloads = downloadResults.filter(result => result.success);
    
    if (successfulDownloads.length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: '所有下载均失败',
        details: downloadResults
      });
    }
    
    // 如果只有一个文件，直接发送
    if (successfulDownloads.length === 1) {
      return res.download(
        successfulDownloads[0].filePath, 
        successfulDownloads[0].fileName
      );
    }
    
    // 创建ZIP文件
    const archiver = require('archiver');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      // 发送ZIP文件
      res.download(zipFilePath, zipFileName);
      
      // 设置清理定时器 (24小时后删除文件)
      setTimeout(() => {
        if (fs.existsSync(zipFilePath)) {
          fs.unlinkSync(zipFilePath);
        }
        
        // 删除单个文件
        successfulDownloads.forEach(download => {
          if (fs.existsSync(download.filePath)) {
            fs.unlinkSync(download.filePath);
          }
        });
      }, 24 * 60 * 60 * 1000);
    });
    
    archive.pipe(output);
    
    // 添加文件到ZIP
    successfulDownloads.forEach(download => {
      archive.file(download.filePath, { name: download.fileName });
    });
    
    archive.finalize();
    
  } catch (error) {
    console.error('Batch download error:', error);
    res.status(500).json({ 
      success: false, 
      error: '批量下载失败，请稍后再试'
    });
  }
});

// 处理404
app.use((req, res) => {
  res.status(404).json({ success: false, error: '未找到请求的资源' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: '服务器内部错误',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Instagram Downloader API 服务器已启动，监听端口 ${PORT}`);
}); 