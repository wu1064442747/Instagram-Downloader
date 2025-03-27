// 这个文件是给Cloudflare Workers使用的入口文件

import { Router } from 'itty-router';

// 创建路由器
const router = Router();

// 缓存设置
const CACHE_TTL = 3600; // 缓存1小时

// 定义Instagram URL验证函数
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

// 获取缩略图
async function fetchThumbnail(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // 简单的正则表达式匹配OG图片URL
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
    
    // 尝试匹配JSON数据
    const jsonMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        if (jsonData.image) {
          return jsonData.image;
        }
      } catch (e) {
        // JSON解析错误
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// 直接重定向到Instagram视频下载服务
function redirectToDownloader(url, quality, format) {
  // 这里使用你选择的可靠第三方服务
  // 例如 ssyoutube, savefrom 等
  const downloaderBaseUrl = "https://ssinstagram.com/api/instagram/downloader";
  const redirectUrl = `${downloaderBaseUrl}?url=${encodeURIComponent(url)}&quality=${quality || 'highest'}&format=${format || 'mp4'}`;
  return Response.redirect(redirectUrl, 302);
}

// 缩略图路由
router.get('/api/thumbnail', async (request) => {
  const url = new URL(request.url).searchParams.get('url');
  
  if (!url || !isValidInstagramUrl(url)) {
    return new Response(
      JSON.stringify({ success: false, error: '无效的Instagram URL' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
  
  // 尝试从缓存获取
  const cacheKey = `thumbnail:${url}`;
  const cache = caches.default;
  let response = await cache.match(cacheKey);
  
  if (!response) {
    // 从Instagram获取缩略图
    const thumbnail = await fetchThumbnail(url);
    
    if (!thumbnail) {
      return new Response(
        JSON.stringify({ success: false, error: '获取缩略图失败' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // 创建响应并缓存
    response = new Response(
      JSON.stringify({ success: true, thumbnail }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${CACHE_TTL}`
        } 
      }
    );
    
    // 将结果存入缓存
    await cache.put(cacheKey, response.clone());
  }
  
  return response;
});

// 下载路由 - 重定向到可靠的下载服务
router.get('/api/download', async (request) => {
  const url = new URL(request.url).searchParams;
  const instagramUrl = url.get('url');
  const quality = url.get('quality') || 'highest';
  const format = url.get('format') || 'original';
  
  if (!instagramUrl || !isValidInstagramUrl(instagramUrl)) {
    return new Response(
      JSON.stringify({ success: false, error: '无效的Instagram URL' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
  
  // 重定向到下载服务
  return redirectToDownloader(instagramUrl, quality, format);
});

// 为批量下载API创建代理
router.post('/api/batch-download', async (request) => {
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: '无效的请求体' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
  
  const { urls, quality, format } = requestBody;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: '请提供有效的URL列表' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
  
  if (urls.length > 10) {
    return new Response(
      JSON.stringify({ success: false, error: '每次最多批量下载10个链接' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
  
  // 这个功能在Workers中难以实现，返回错误信息
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: '批量下载在此版本中不可用，请使用单个下载功能',
      urls: urls.map(url => {
        return {
          url,
          downloadUrl: `/api/download?url=${encodeURIComponent(url)}&quality=${quality || 'highest'}&format=${format || 'original'}`
        };
      })
    }),
    { 
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
});

// 主页
router.get('/', () => {
  return fetch('https://fastdl.space/'); // 替换为你的前端网站
});

// 捕获所有其他路由
router.all('*', () => {
  return new Response('404 Not Found', { status: 404 });
});

// 导出处理请求的函数
export default {
  async fetch(request, env, ctx) {
    return router.handle(request);
  }
}; 