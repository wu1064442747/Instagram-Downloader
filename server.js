const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const https = require('https');
const crypto = require('crypto');
const { IgApiClient } = require('instagram-private-api');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// 创建临时下载目录
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// 路由：主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 路由：英文版主页
app.get('/en', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-en.html'));
});

// API路由：处理Instagram下载请求
app.post('/api/download', async (req, res) => {
    try {
        const { url, type = 'auto', quality = 'auto' } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }
        
        // 解析Instagram URL，确定内容类型
        const contentType = determineContentType(url);
        
        // 根据内容类型执行相应的下载逻辑
        let downloadData;
        
        switch (contentType) {
            case 'video':
                downloadData = await downloadInstagramVideo(url, quality);
                break;
            case 'photo':
                downloadData = await downloadInstagramPhoto(url);
                break;
            case 'reels':
                downloadData = await downloadInstagramReels(url, quality);
                break;
            case 'story':
                downloadData = await downloadInstagramStory(url);
                break;
            default:
                // 自动检测内容类型
                downloadData = await autoDetectAndDownload(url, quality);
                break;
        }
        
        res.json({ success: true, ...downloadData });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, error: error.message || 'Download failed' });
    }
});

// API路由：处理音频提取请求
app.post('/api/extract-audio', async (req, res) => {
    try {
        const { url, format = 'mp3' } = req.body;
        
        if (!url) {
            return res.status(400).json({ success: false, error: 'URL is required' });
        }
        
        const audioData = await extractAudioFromVideo(url, format);
        res.json({ success: true, ...audioData });
    } catch (error) {
        console.error('Audio extraction error:', error);
        res.status(500).json({ success: false, error: error.message || 'Audio extraction failed' });
    }
});

// API路由：处理私密内容下载请求
app.post('/api/download-private', async (req, res) => {
    try {
        const { url, username, password } = req.body;
        
        if (!url || !username || !password) {
            return res.status(400).json({ success: false, error: 'URL, username and password are required' });
        }
        
        const downloadData = await downloadPrivateContent(url, username, password);
        res.json({ success: true, ...downloadData });
    } catch (error) {
        console.error('Private download error:', error);
        res.status(500).json({ success: false, error: error.message || 'Private download failed' });
    }
});

// API路由：处理批量下载请求
app.post('/api/batch-download', async (req, res) => {
    try {
        const { urls } = req.body;
        
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ success: false, error: 'Valid URLs array is required' });
        }
        
        // 限制最大批量下载数量
        const maxBatchSize = 10;
        const urlsToProcess = urls.slice(0, maxBatchSize);
        
        // 并行处理下载请求
        const downloadPromises = urlsToProcess.map(url => autoDetectAndDownload(url));
        const results = await Promise.allSettled(downloadPromises);
        
        // 处理结果
        const downloadResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return {
                    url: urlsToProcess[index],
                    success: true,
                    ...result.value
                };
            } else {
                return {
                    url: urlsToProcess[index],
                    success: false,
                    error: result.reason.message || 'Download failed'
                };
            }
        });
        
        res.json({ success: true, results: downloadResults });
    } catch (error) {
        console.error('Batch download error:', error);
        res.status(500).json({ success: false, error: error.message || 'Batch download failed' });
    }
});

// 实用函数：确定内容类型
function determineContentType(url) {
    // 简单的URL模式匹配
    if (url.includes('/reel/') || url.includes('/reels/')) {
        return 'reels';
    } else if (url.includes('/stories/')) {
        return 'story';
    } else if (url.includes('/p/')) {
        // 这里需要进一步检查是视频还是照片
        return 'auto'; // 自动检测
    } else {
        return 'auto'; // 默认自动检测
    }
}

// 实用函数：自动检测内容类型并下载
async function autoDetectAndDownload(url, quality = 'auto') {
    try {
        // 获取页面HTML
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        
        // 检查是否有视频元素
        const hasVideo = $('video').length > 0 || html.includes('video_url');
        
        if (hasVideo) {
            // 检查是否是Reels
            if (url.includes('/reel/') || url.includes('/reels/')) {
                return await downloadInstagramReels(url, quality);
            } else {
                return await downloadInstagramVideo(url, quality);
            }
        } else {
            // 假设是照片
            return await downloadInstagramPhoto(url);
        }
    } catch (error) {
        throw new Error(`Auto-detection failed: ${error.message}`);
    }
}

// 实用函数：下载Instagram视频
async function downloadInstagramVideo(url, quality = 'auto') {
    try {
        // 提取视频URL
        const response = await axios.get(url);
        const html = response.data;
        
        // 使用正则表达式提取视频URL
        const videoUrlRegex = /"video_url":"([^"]+)"/;
        const match = html.match(videoUrlRegex);
        
        if (!match) {
            throw new Error('No video found at this URL');
        }
        
        // 解码视频URL
        let videoUrl = match[1].replace(/\\u0026/g, '&');
        
        // 根据请求的质量选择适当的视频URL（如果可用）
        if (quality !== 'auto') {
            // 这里需要根据Instagram API的实际响应进行调整
            // 这只是一个简化的示例
            const qualityUrlRegex = new RegExp(`"${quality}_video_url":"([^"]+)"`);
            const qualityMatch = html.match(qualityUrlRegex);
            
            if (qualityMatch) {
                videoUrl = qualityMatch[1].replace(/\\u0026/g, '&');
            }
        }
        
        // 生成唯一的文件名
        const filename = `instagram_video_${crypto.randomBytes(8).toString('hex')}.mp4`;
        const filePath = path.join(downloadsDir, filename);
        
        // 创建写入流
        const writer = fs.createWriteStream(filePath);
        
        // 下载视频
        const videoResponse = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });
        
        videoResponse.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                // 获取文件大小
                const stats = fs.statSync(filePath);
                const fileSizeInBytes = stats.size;
                const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
                
                resolve({
                    downloadUrl: `/downloads/${filename}`,
                    filename: filename,
                    type: 'video/mp4',
                    quality: quality !== 'auto' ? quality : 'HD',
                    size: `${fileSizeInMB} MB`
                });
            });
            
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Video download failed: ${error.message}`);
    }
}

// 实用函数：下载Instagram照片
async function downloadInstagramPhoto(url) {
    try {
        // 提取照片URL
        const response = await axios.get(url);
        const html = response.data;
        
        // 使用正则表达式提取照片URL
        const photoUrlRegex = /"display_url":"([^"]+)"/;
        const match = html.match(photoUrlRegex);
        
        if (!match) {
            throw new Error('No photo found at this URL');
        }
        
        // 解码照片URL
        const photoUrl = match[1].replace(/\\u0026/g, '&');
        
        // 生成唯一的文件名
        const filename = `instagram_photo_${crypto.randomBytes(8).toString('hex')}.jpg`;
        const filePath = path.join(downloadsDir, filename);
        
        // 创建写入流
        const writer = fs.createWriteStream(filePath);
        
        // 下载照片
        const photoResponse = await axios({
            url: photoUrl,
            method: 'GET',
            responseType: 'stream'
        });
        
        photoResponse.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                // 获取文件大小
                const stats = fs.statSync(filePath);
                const fileSizeInBytes = stats.size;
                const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
                
                resolve({
                    downloadUrl: `/downloads/${filename}`,
                    filename: filename,
                    type: 'image/jpeg',
                    quality: 'Original',
                    size: `${fileSizeInMB} MB`
                });
            });
            
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Photo download failed: ${error.message}`);
    }
}

// 实用函数：下载Instagram Reels
async function downloadInstagramReels(url, quality = 'auto') {
    // 对于Reels，我们可以复用视频下载逻辑
    return await downloadInstagramVideo(url, quality);
}

// 实用函数：下载Instagram Stories
async function downloadInstagramStory(url) {
    try {
        // Stories需要更复杂的处理，通常需要使用Instagram API
        // 这里只是一个简化的示例
        // 在实际实现中，可能需要使用非官方API或处理更复杂的逻辑
        
        // 提取用户名
        const urlParts = url.split('/');
        const usernameIndex = urlParts.indexOf('stories') + 1;
        
        if (usernameIndex >= urlParts.length) {
            throw new Error('Invalid Stories URL format');
        }
        
        const username = urlParts[usernameIndex];
        
        // 这里应该使用Instagram API获取Stories
        // 下面是一个模拟的实现
        
        // 生成唯一的文件名 (假设是视频)
        const filename = `instagram_story_${crypto.randomBytes(8).toString('hex')}.mp4`;
        const filePath = path.join(downloadsDir, filename);
        
        // 在这里，我们应该通过API获取实际的Stories内容并下载
        // 由于这需要实际的Instagram API调用，这里只是一个示例
        
        return {
            downloadUrl: `/downloads/${filename}`,
            filename: filename,
            type: 'video/mp4', // 或 'image/jpeg'，取决于实际内容
            quality: 'Original',
            size: 'Unknown' // 实际实现中应该计算实际大小
        };
    } catch (error) {
        throw new Error(`Stories download failed: ${error.message}`);
    }
}

// 实用函数：从视频中提取音频
async function extractAudioFromVideo(url, format = 'mp3') {
    try {
        // 首先下载视频
        const videoData = await downloadInstagramVideo(url);
        const videoPath = path.join(__dirname, videoData.downloadUrl);
        
        // 生成音频文件名
        const audioFilename = `instagram_audio_${crypto.randomBytes(8).toString('hex')}.${format}`;
        const audioPath = path.join(downloadsDir, audioFilename);
        
        // 使用ffmpeg提取音频
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .noVideo()
                .audioCodec(format === 'mp3' ? 'libmp3lame' : 'aac')
                .save(audioPath)
                .on('end', () => {
                    // 获取文件大小
                    const stats = fs.statSync(audioPath);
                    const fileSizeInBytes = stats.size;
                    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
                    
                    resolve({
                        downloadUrl: `/downloads/${audioFilename}`,
                        filename: audioFilename,
                        type: format === 'mp3' ? 'audio/mpeg' : 'audio/m4a',
                        quality: '128kbps', // 默认音频质量
                        size: `${fileSizeInMB} MB`
                    });
                })
                .on('error', (err) => {
                    reject(new Error(`Audio extraction failed: ${err.message}`));
                });
        });
    } catch (error) {
        throw new Error(`Audio extraction failed: ${error.message}`);
    }
}

// 实用函数：下载私密内容
async function downloadPrivateContent(url, username, password) {
    try {
        const ig = new IgApiClient();
        ig.state.generateDevice(username);
        
        // 登录
        await ig.account.login(username, password);
        
        // 提取媒体ID
        const mediaId = extractMediaId(url);
        
        if (!mediaId) {
            throw new Error('Could not extract media ID from URL');
        }
        
        // 获取媒体信息
        const mediaInfo = await ig.media.info(mediaId);
        
        // 检查是视频还是照片
        const isVideo = mediaInfo.items[0].video_versions && mediaInfo.items[0].video_versions.length > 0;
        
        if (isVideo) {
            // 下载视频
            const videoUrl = mediaInfo.items[0].video_versions[0].url;
            
            // 生成唯一的文件名
            const filename = `instagram_private_video_${crypto.randomBytes(8).toString('hex')}.mp4`;
            const filePath = path.join(downloadsDir, filename);
            
            // 下载视频
            await downloadFile(videoUrl, filePath);
            
            // 获取文件大小
            const stats = fs.statSync(filePath);
            const fileSizeInBytes = stats.size;
            const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
            
            return {
                downloadUrl: `/downloads/${filename}`,
                filename: filename,
                type: 'video/mp4',
                quality: 'Original',
                size: `${fileSizeInMB} MB`
            };
        } else {
            // 下载照片
            const photoUrl = mediaInfo.items[0].image_versions2.candidates[0].url;
            
            // 生成唯一的文件名
            const filename = `instagram_private_photo_${crypto.randomBytes(8).toString('hex')}.jpg`;
            const filePath = path.join(downloadsDir, filename);
            
            // 下载照片
            await downloadFile(photoUrl, filePath);
            
            // 获取文件大小
            const stats = fs.statSync(filePath);
            const fileSizeInBytes = stats.size;
            const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
            
            return {
                downloadUrl: `/downloads/${filename}`,
                filename: filename,
                type: 'image/jpeg',
                quality: 'Original',
                size: `${fileSizeInMB} MB`
            };
        }
    } catch (error) {
        throw new Error(`Private content download failed: ${error.message}`);
    }
}

// 实用函数：从URL提取媒体ID
function extractMediaId(url) {
    // 这是一个简化的实现，实际上可能需要更复杂的逻辑
    const regex = /\/p\/([^\/]+)/;
    const match = url.match(regex);
    
    if (match && match[1]) {
        return match[1];
    }
    
    return null;
}

// 实用函数：下载文件
function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
            response.pipe(writer);
            
            writer.on('finish', resolve);
            writer.on('error', reject);
        }).on('error', reject);
    });
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// 定期清理下载目录中的旧文件
setInterval(() => {
    try {
        const files = fs.readdirSync(downloadsDir);
        const now = Date.now();
        
        files.forEach(file => {
            const filePath = path.join(downloadsDir, file);
            const stats = fs.statSync(filePath);
            const fileAge = now - stats.mtimeMs;
            
            // 删除超过24小时的文件
            if (fileAge > 24 * 60 * 60 * 1000) {
                fs.unlinkSync(filePath);
                console.log(`Deleted old file: ${file}`);
            }
        });
    } catch (error) {
        console.error('Error cleaning downloads directory:', error);
    }
}, 60 * 60 * 1000); // 每小时执行一次 