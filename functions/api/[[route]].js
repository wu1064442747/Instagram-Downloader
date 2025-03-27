// Cloudflare Pages Functions 处理API请求

// 添加CORS头部
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 定义Instagram URL验证函数
function isValidInstagramUrl(url) {
  try {
    const urlObj = new URL(url);
    return (urlObj.hostname.includes('instagram.com') || 
            urlObj.hostname.includes('www.instagram.com')) && 
           (url.includes('/p/') || 
            url.includes('/reel/') || 
            url.includes('/reels/') || 
            url.includes('/stories/') || 
            url.includes('/story/') || 
            url.includes('/tv/'));
  } catch (error) {
    console.error('URL验证错误:', error);
    return false;
  }
}

// 获取缩略图
async function fetchThumbnail(url) {
  try {
    console.log('正在获取缩略图，URL:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      console.error('获取HTML失败:', response.status);
      return null;
    }

    const html = await response.text();
    
    // 首先尝试匹配OG图片
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImageMatch && ogImageMatch[1]) {
      console.log('找到OG图片:', ogImageMatch[1]);
      return ogImageMatch[1];
    }
    
    // 然后尝试匹配JSON-LD数据
    const jsonMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        if (jsonData.image) {
          console.log('找到JSON-LD图片:', jsonData.image);
          return jsonData.image;
        }
      } catch (e) {
        console.error('JSON解析错误:', e);
      }
    }

    // 最后尝试匹配任何图片URL
    const anyImageMatch = html.match(/"display_url":"([^"]+)"/);
    if (anyImageMatch && anyImageMatch[1]) {
      const imageUrl = anyImageMatch[1].replace(/\\u0026/g, '&');
      console.log('找到其他图片URL:', imageUrl);
      return imageUrl;
    }
    
    console.error('未找到缩略图');
    return null;
  } catch (error) {
    console.error('缩略图获取错误:', error);
    return null;
  }
}

// 直接重定向到Instagram视频下载服务
function redirectToDownloader(url, quality, format) {
  // 这里使用可靠第三方服务
  const downloaderBaseUrl = "https://ssinstagram.com/api/instagram/downloader";
  const redirectUrl = `${downloaderBaseUrl}?url=${encodeURIComponent(url)}&quality=${quality || 'highest'}&format=${format || 'mp4'}`;
  console.log('重定向到:', redirectUrl);
  return Response.redirect(redirectUrl, 302);
}

// 处理缩略图请求
async function handleThumbnailRequest(request) {
  console.log('处理缩略图请求:', request.url);
  const url = new URL(request.url).searchParams.get('url');
  
  if (!url) {
    console.error('未提供URL参数');
    return new Response(
      JSON.stringify({ success: false, error: '缺少URL参数' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 400 
      }
    );
  }
  
  if (!isValidInstagramUrl(url)) {
    console.error('无效的Instagram URL:', url);
    return new Response(
      JSON.stringify({ success: false, error: '无效的Instagram URL', url: url }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 400 
      }
    );
  }
  
  // 从Instagram获取缩略图
  const thumbnail = await fetchThumbnail(url);
  
  if (!thumbnail) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '获取缩略图失败',
        fallback: 'https://via.placeholder.com/640x640.png?text=Instagram+Content'
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
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
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders
      } 
    }
  );
}

// 处理下载请求
function handleDownloadRequest(request) {
  console.log('处理下载请求:', request.url);
  const url = new URL(request.url).searchParams;
  const instagramUrl = url.get('url');
  const quality = url.get('quality') || 'highest';
  const format = url.get('format') || 'original';
  
  if (!instagramUrl) {
    console.error('未提供URL参数');
    return new Response(
      JSON.stringify({ success: false, error: '缺少URL参数' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 400 
      }
    );
  }
  
  if (!isValidInstagramUrl(instagramUrl)) {
    console.error('无效的Instagram URL:', instagramUrl);
    return new Response(
      JSON.stringify({ success: false, error: '无效的Instagram URL', url: instagramUrl }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 400 
      }
    );
  }
  
  // 重定向到下载服务
  return redirectToDownloader(instagramUrl, quality, format);
}

// 处理OPTIONS请求，用于CORS预检
function handleOptions() {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      'Allow': 'GET, POST, OPTIONS',
    }
  });
}

// 主函数，处理所有API请求
export async function onRequest(context) {
  const { request } = context;
  console.log('收到请求:', request.method, request.url);
  
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }
  
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 根据路径处理不同的API请求
  if (path.endsWith('/api/thumbnail')) {
    return handleThumbnailRequest(request);
  } else if (path.endsWith('/api/download')) {
    return handleDownloadRequest(request);
  }
  
  // 未知API路径
  return new Response('API endpoint not found', { 
    status: 404,
    headers: corsHeaders
  });
} 