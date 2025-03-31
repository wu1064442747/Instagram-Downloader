import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import Redis from 'redis';

const redis = Redis.createClient({
  url: process.env.REDIS_URL,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    // 检查缓存
    const cached = await redis.get(url);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // 获取媒体信息
    const mediaInfo = await page.evaluate(() => {
      const videoElement = document.querySelector('video');
      const imageElement = document.querySelector('img[src*="instagram"]');
      
      if (videoElement) {
        return {
          type: 'video',
          url: videoElement.src,
          thumbnail: videoElement.poster,
        };
      }
      
      if (imageElement) {
        return {
          type: 'image',
          url: imageElement.src,
        };
      }

      return null;
    });

    await browser.close();

    if (!mediaInfo) {
      return res.status(404).json({ message: 'No media found' });
    }

    // 缓存结果
    await redis.set(url, JSON.stringify(mediaInfo), 'EX', 3600);

    return res.status(200).json(mediaInfo);
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ message: 'Failed to download content' });
  }
} 