/**
 * Instagram Downloader Worker
 * 基于Cloudflare Workers实现Instagram内容下载
 */

// 允许的请求来源域名列表
const ALLOWED_ORIGINS = [
  'https://fastdl.space',
  'https://www.fastdl.space',
  'http://localhost:8000', // 开发环境
];

// 请求头设置
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// 用户代理设置为移动设备，有助于获取更好的兼容性
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1';

// 工作函数
addEventListener('fetch', event => {
  // 处理OPTIONS预检请求
  if (event.request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(event.request));
  }
  
  return event.respondWith(handleRequest(event.request));
});

/**
 * 处理OPTIONS预检请求
 * @param {Request} request
 * @returns {Response}
 */
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

/**
 * 主请求处理函数
 * @param {Request} request
 * @returns {Response}
 */
async function handleRequest(request) {
  // 检查请求方法
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      message: '只支持POST请求' 
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      }
    });
  }
  
  try {
    // 获取POST数据
    const requestData = await request.json();
    const { url } = requestData;
    
    if (!url) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '缺少Instagram URL' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });
    }
    
    // 检查URL是否是Instagram链接
    if (!isInstagramUrl(url)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '无效的Instagram链接' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });
    }
    
    // 处理不同类型的Instagram内容
    const type = detectContentType(url);
    let result;
    
    switch (type) {
      case 'Reels':
        result = await downloadReels(url);
        break;
      case 'Story':
        result = await downloadStory(url);
        break;
      case 'Photo':
        result = await downloadPhoto(url);
        break;
      case 'Video':
        result = await downloadVideo(url);
        break;
      default:
        result = await downloadGeneric(url);
    }
    
    // 响应结果
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      }
    });
    
  } catch (error) {
    console.error('处理请求时出错:', error);
    
    // 返回错误响应
    return new Response(JSON.stringify({ 
      success: false, 
      message: '处理请求时出错', 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      }
    });
  }
}

/**
 * 检查URL是否是Instagram链接
 * @param {string} url
 * @returns {boolean}
 */
function isInstagramUrl(url) {
  return url.includes('instagram.com') || url.includes('instagr.am');
}

/**
 * 检测内容类型
 * @param {string} url
 * @returns {string}
 */
function detectContentType(url) {
  if (url.includes('/reel/') || url.includes('/reels/')) {
    return 'Reels';
  } else if (url.includes('/stories/')) {
    return 'Story';
  } else if (url.includes('/p/')) {
    // 需要进一步检查实际内容类型
    return 'Generic';
  } else {
    return 'Generic';
  }
}

/**
 * 提取Instagram媒体ID
 * @param {string} url
 * @returns {string|null}
 */
function extractMediaId(url) {
  // 处理短链接和正常链接
  let mediaId = null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p !== '');
    
    // 根据不同URL格式提取ID
    if (pathParts.includes('p') || pathParts.includes('reel')) {
      // 格式: /p/{mediaId}/ 或 /reel/{mediaId}/
      const idIndex = pathParts.indexOf('p') !== -1 
        ? pathParts.indexOf('p') + 1 
        : pathParts.indexOf('reel') + 1;
        
      if (pathParts.length > idIndex) {
        mediaId = pathParts[idIndex];
      }
    } else if (pathParts.includes('stories')) {
      // 故事格式: /stories/{username}/{storyId}/
      if (pathParts.length > 2) {
        mediaId = pathParts[pathParts.length - 1];
      }
    }
  } catch (e) {
    console.error('提取媒体ID时出错:', e);
  }
  
  return mediaId;
}

/**
 * 获取Instagram页面HTML内容
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchInstagramPage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });
  
  if (!response.ok) {
    throw new Error(`获取页面失败: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}

/**
 * 从HTML中提取JSON数据
 * @param {string} html
 * @returns {Object|null}
 */
function extractJsonData(html) {
  try {
    // 查找包含共享数据的脚本标签
    const dataRegex = /window\._sharedData\s*=\s*({.+?});/;
    const additionalDataRegex = /window\.__additionalDataLoaded\s*\(\s*['"][^'"]+['"],\s*({.+?})\s*\);/;
    
    // 尝试从不同位置提取数据
    let match = html.match(dataRegex);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    
    match = html.match(additionalDataRegex);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    
    return null;
  } catch (e) {
    console.error('提取JSON数据时出错:', e);
    return null;
  }
}

/**
 * 下载Reels视频
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function downloadReels(url) {
  try {
    const html = await fetchInstagramPage(url);
    const jsonData = extractJsonData(html);
    
    if (!jsonData) {
      throw new Error('无法提取视频数据');
    }
    
    // 尝试从不同的数据结构中找到视频URL
    let videoUrl = null;
    let thumbnail = null;
    let title = 'Instagram Reel';
    
    // 根据Instagram的数据结构提取视频URL
    // 注意：Instagram经常更改其数据结构，可能需要定期更新此逻辑
    if (jsonData.items && jsonData.items[0]) {
      const item = jsonData.items[0];
      if (item.video_versions && item.video_versions.length > 0) {
        videoUrl = item.video_versions[0].url;
      }
      if (item.image_versions2 && item.image_versions2.candidates.length > 0) {
        thumbnail = item.image_versions2.candidates[0].url;
      }
      if (item.caption && item.caption.text) {
        title = item.caption.text.substring(0, 50);
      }
    } else if (jsonData.graphql && jsonData.graphql.shortcode_media) {
      const media = jsonData.graphql.shortcode_media;
      if (media.is_video && media.video_url) {
        videoUrl = media.video_url;
      }
      if (media.display_url) {
        thumbnail = media.display_url;
      }
      if (media.edge_media_to_caption && 
          media.edge_media_to_caption.edges && 
          media.edge_media_to_caption.edges[0] &&
          media.edge_media_to_caption.edges[0].node) {
        title = media.edge_media_to_caption.edges[0].node.text.substring(0, 50);
      }
    }
    
    if (!videoUrl) {
      return { success: false, message: '无法找到Reels视频URL' };
    }
    
    return {
      success: true,
      type: 'Reels',
      url: videoUrl,
      thumbnail: thumbnail || '',
      title: title,
      size: 'Unknown'
    };
  } catch (error) {
    console.error('下载Reels视频时出错:', error);
    return { success: false, message: '下载Reels视频时出错', error: error.message };
  }
}

/**
 * 下载Story
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function downloadStory(url) {
  try {
    // 由于Stories需要登录，我们提供模拟响应
    // 在实际实现中，您可能需要使用Instagram的私有API或第三方服务
    
    return {
      success: false,
      message: 'Instagram Stories通常需要登录才能访问，请考虑使用登录凭证的高级功能'
    };
  } catch (error) {
    console.error('下载Story时出错:', error);
    return { success: false, message: '下载Story时出错', error: error.message };
  }
}

/**
 * 下载照片
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function downloadPhoto(url) {
  try {
    const html = await fetchInstagramPage(url);
    const jsonData = extractJsonData(html);
    
    if (!jsonData) {
      throw new Error('无法提取照片数据');
    }
    
    // 尝试从不同的数据结构中找到照片URL
    let photoUrl = null;
    let title = 'Instagram Photo';
    
    if (jsonData.graphql && jsonData.graphql.shortcode_media) {
      const media = jsonData.graphql.shortcode_media;
      if (media.display_url) {
        photoUrl = media.display_url;
      } else if (media.display_resources && media.display_resources.length > 0) {
        // 获取最高分辨率
        photoUrl = media.display_resources[media.display_resources.length - 1].src;
      }
      
      if (media.edge_media_to_caption && 
          media.edge_media_to_caption.edges && 
          media.edge_media_to_caption.edges[0] &&
          media.edge_media_to_caption.edges[0].node) {
        title = media.edge_media_to_caption.edges[0].node.text.substring(0, 50);
      }
    }
    
    if (!photoUrl) {
      return { success: false, message: '无法找到照片URL' };
    }
    
    return {
      success: true,
      type: 'Photo',
      url: photoUrl,
      thumbnail: photoUrl,
      title: title,
      size: 'Unknown'
    };
  } catch (error) {
    console.error('下载照片时出错:', error);
    return { success: false, message: '下载照片时出错', error: error.message };
  }
}

/**
 * 下载视频
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function downloadVideo(url) {
  // 由于帖子视频下载逻辑与Reels类似，我们复用Reels下载函数
  return downloadReels(url);
}

/**
 * 通用下载功能，尝试检测内容类型并下载
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function downloadGeneric(url) {
  try {
    const html = await fetchInstagramPage(url);
    const jsonData = extractJsonData(html);
    
    if (!jsonData) {
      throw new Error('无法提取内容数据');
    }
    
    // 检测内容类型
    let isVideo = false;
    let mediaUrl = null;
    let thumbnail = null;
    let title = 'Instagram Content';
    
    if (jsonData.graphql && jsonData.graphql.shortcode_media) {
      const media = jsonData.graphql.shortcode_media;
      isVideo = media.is_video;
      
      if (isVideo && media.video_url) {
        mediaUrl = media.video_url;
      } else if (media.display_url) {
        mediaUrl = media.display_url;
      } else if (media.display_resources && media.display_resources.length > 0) {
        mediaUrl = media.display_resources[media.display_resources.length - 1].src;
      }
      
      thumbnail = media.display_url || '';
      
      if (media.edge_media_to_caption && 
          media.edge_media_to_caption.edges && 
          media.edge_media_to_caption.edges[0] &&
          media.edge_media_to_caption.edges[0].node) {
        title = media.edge_media_to_caption.edges[0].node.text.substring(0, 50);
      }
    }
    
    if (!mediaUrl) {
      return { success: false, message: '无法找到媒体URL' };
    }
    
    return {
      success: true,
      type: isVideo ? 'Video' : 'Photo',
      url: mediaUrl,
      thumbnail: thumbnail || mediaUrl,
      title: title,
      size: 'Unknown'
    };
  } catch (error) {
    console.error('下载内容时出错:', error);
    return { success: false, message: '下载内容时出错', error: error.message };
  }
} 