const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const chrome = require('@sparticuz/chromium');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 下载API端点
app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url || !url.includes('instagram.com')) {
            return res.status(400).json({ error: 'Invalid Instagram URL' });
        }

        // Vercel环境的Puppeteer配置
        const browser = await puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath(),
            headless: chrome.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // 设置用户代理和其他请求头
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        });

        // 设置请求拦截
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // 等待视频或图片元素加载
        await page.waitForSelector('video, img[src*="instagram"]', { timeout: 5000 });

        // 获取媒体URL
        const mediaInfo = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            if (videoElement) {
                return {
                    type: 'video',
                    url: videoElement.src,
                    poster: videoElement.poster
                };
            }

            const imageElement = document.querySelector('img[src*="instagram"]');
            if (imageElement) {
                return {
                    type: 'image',
                    url: imageElement.src
                };
            }

            return null;
        });

        await browser.close();

        if (!mediaInfo) {
            return res.status(404).json({ error: 'No media found' });
        }

        res.json(mediaInfo);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download content', details: error.message });
    }
});

// Vercel 需要导出 app
module.exports = app;

// 本地开发时使用
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
} 