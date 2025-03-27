// Cloudflare Pages Functions 处理API请求

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
  // 这里使用可靠第三方服务
  const downloaderBaseUrl = "https://ssinstagram.com/api/instagram/downloader";
  const redirectUrl = `${downloaderBaseUrl}?url=${encodeURIComponent(url)}&quality=${quality || 'highest'}&format=${format || 'mp4'}`;
  return Response.redirect(redirectUrl, 302);
}

// 处理缩略图请求
async function handleThumbnailRequest(request) {
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
  
  // 创建响应
  return new Response(
    JSON.stringify({ success: true, thumbnail }),
    { 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      } 
    }
  );
}

// 处理下载请求
function handleDownloadRequest(request) {
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
}

// 主函数，处理所有API请求
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 根据路径处理不同的API请求
  if (path.endsWith('/api/thumbnail')) {
    return handleThumbnailRequest(request);
  } else if (path.endsWith('/api/download')) {
    return handleDownloadRequest(request);
  }
  
  // 未知API路径
  return new Response('API endpoint not found', { status: 404 });
} 