document.addEventListener('DOMContentLoaded', function() {
    // 语言切换功能
    setupLanguageSwitcher();
    
    // 初始化手风琴FAQ
    setupAccordion();
    
    // 设置所有下载表单
    setupDownloadForms();
});

// 语言切换功能
function setupLanguageSwitcher() {
    const languageToggle = document.getElementById('language-toggle');
    const languageOptions = document.querySelectorAll('.language-dropdown a');
    const currentLangSpan = document.querySelector('.current-lang');
    
    // 当前语言（默认为中文）
    let currentLang = 'zh';
    
    // 语言文本映射
    const translations = {
        'zh': {
            'nav_video': '视频下载',
            'nav_reels': 'Reels下载',
            'nav_story': 'Stories下载',
            'nav_photo': '照片下载',
            'nav_audio': '音频下载',
            'nav_private': '私密内容',
            'nav_batch': '批量下载',
            'hero_title': 'Instagram 内容下载工具',
            'hero_subtitle': '下载视频、照片、Reels、Stories和音频，快速且免费',
            'main_placeholder': '粘贴Instagram链接 (视频、照片、Reels、Stories)',
            'download_btn': '下载',
            'feature_speed': '极速下载',
            'feature_speed_desc': '提供最快的下载速度，无需等待',
            'feature_security': '安全保障',
            'feature_security_desc': '无需登录Instagram账号，保护您的隐私',
            'feature_batch': '批量下载',
            'feature_batch_desc': '一次下载多个Instagram内容',
            'feature_quality': '高清质量',
            'feature_quality_desc': '支持高达4K清晰度的原始质量下载',
            // 其他翻译...
        },
        'en': {
            'nav_video': 'Video Download',
            'nav_reels': 'Reels Download',
            'nav_story': 'Stories Download',
            'nav_photo': 'Photo Download',
            'nav_audio': 'Audio Download',
            'nav_private': 'Private Content',
            'nav_batch': 'Batch Download',
            'hero_title': 'Instagram Content Downloader',
            'hero_subtitle': 'Download videos, photos, Reels, Stories and audio, fast and free',
            'main_placeholder': 'Paste Instagram link (video, photo, Reels, Stories)',
            'download_btn': 'Download',
            'feature_speed': 'Fast Download',
            'feature_speed_desc': 'Provides the fastest download speed, no waiting',
            'feature_security': 'Security Guaranteed',
            'feature_security_desc': 'No Instagram login required, protecting your privacy',
            'feature_batch': 'Batch Download',
            'feature_batch_desc': 'Download multiple Instagram content at once',
            'feature_quality': 'HD Quality',
            'feature_quality_desc': 'Supports original quality downloads up to 4K resolution',
            // 其他翻译...
        }
    };
    
    // 处理语言切换
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            currentLang = lang;
            currentLangSpan.textContent = lang === 'zh' ? '中文' : 'English';
            
            // 更新页面上的文本
            updatePageLanguage(lang);
        });
    });
    
    // 更新页面语言
    function updatePageLanguage(lang) {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translations[lang][key];
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });
        
        // 更新网页标题
        document.title = lang === 'zh' ? 'FastDL - Instagram 内容下载工具' : 'FastDL - Instagram Content Downloader';
    }
    
    // 初始化添加翻译数据属性
    function initTranslationAttributes() {
        // 导航菜单
        document.querySelector('a[href="#video"]').setAttribute('data-translate', 'nav_video');
        document.querySelector('a[href="#reels"]').setAttribute('data-translate', 'nav_reels');
        document.querySelector('a[href="#story"]').setAttribute('data-translate', 'nav_story');
        document.querySelector('a[href="#photo"]').setAttribute('data-translate', 'nav_photo');
        document.querySelector('a[href="#audio"]').setAttribute('data-translate', 'nav_audio');
        document.querySelector('a[href="#private"]').setAttribute('data-translate', 'nav_private');
        document.querySelector('a[href="#batch"]').setAttribute('data-translate', 'nav_batch');
        
        // 英雄区域
        document.querySelector('.hero h1').setAttribute('data-translate', 'hero_title');
        document.querySelector('.hero h2').setAttribute('data-translate', 'hero_subtitle');
        document.getElementById('main-url').setAttribute('data-translate', 'main_placeholder');
        
        // 下载按钮
        const downloadButtons = document.querySelectorAll('.download-btn');
        downloadButtons.forEach(btn => {
            btn.setAttribute('data-translate', 'download_btn');
        });
        
        // 特性区域
        const featureElements = document.querySelectorAll('.feature-box h3');
        featureElements[0].setAttribute('data-translate', 'feature_speed');
        featureElements[1].setAttribute('data-translate', 'feature_security');
        featureElements[2].setAttribute('data-translate', 'feature_batch');
        featureElements[3].setAttribute('data-translate', 'feature_quality');
        
        const featureDescElements = document.querySelectorAll('.feature-box p');
        featureDescElements[0].setAttribute('data-translate', 'feature_speed_desc');
        featureDescElements[1].setAttribute('data-translate', 'feature_security_desc');
        featureDescElements[2].setAttribute('data-translate', 'feature_batch_desc');
        featureDescElements[3].setAttribute('data-translate', 'feature_quality_desc');
        
        // 可以继续添加更多元素...
    }
    
    // 初始化翻译属性
    initTranslationAttributes();
}

// 设置FAQ手风琴效果
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // 关闭其他展开的项
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this) {
                    otherHeader.classList.remove('active');
                }
            });
        });
    });
}

// 设置所有下载表单
function setupDownloadForms() {
    // 主表单
    setupForm('main-form', 'main-url', 'main-loader', 'download-results');
    
    // 视频下载表单
    setupForm('video-form', 'video-url', 'video-loader', 'video-results');
    
    // Reels下载表单
    setupForm('reels-form', 'reels-url', 'reels-loader', 'reels-results');
    
    // Stories下载表单
    setupForm('story-form', 'story-url', 'story-loader', 'story-results');
    
    // 照片下载表单
    setupForm('photo-form', 'photo-url', 'photo-loader', 'photo-results');
    
    // 音频下载表单
    setupForm('audio-form', 'audio-url', 'audio-loader', 'audio-results');
    
    // 私密内容下载表单
    setupPrivateForm();
    
    // 批量下载表单
    setupBatchForm();
}

// 设置表单提交处理
function setupForm(formId, inputId, loaderId, resultsId) {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const loader = document.getElementById(loaderId);
    const results = document.getElementById(resultsId);
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const url = input.value.trim();
        if (!url) {
            showError(results, '请输入有效的Instagram链接');
            return;
        }
        
        // 显示加载器
        loader.style.display = 'block';
        results.style.display = 'none';
        
        // 模拟API调用 (在实际应用中，这里应该调用您的后端API)
        setTimeout(function() {
            // 隐藏加载器
            loader.style.display = 'none';
            
            // 处理下载链接 (这是模拟的数据，实际应用需要替换)
            const downloadLinks = [
                {
                    url: 'https://example.com/download/video1.mp4',
                    quality: 'HD (1080p)',
                    size: '15.2 MB',
                    type: 'video/mp4'
                }
            ];
            
            displayResults(results, downloadLinks);
        }, 2000); // 模拟2秒的API调用
    });
}

// 设置私密内容下载表单
function setupPrivateForm() {
    const form = document.getElementById('private-form');
    const urlInput = document.getElementById('private-url');
    const usernameInput = document.getElementById('private-username');
    const passwordInput = document.getElementById('private-password');
    const loader = document.getElementById('private-loader');
    const results = document.getElementById('private-results');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!url || !username || !password) {
            showError(results, '请填写所有必填字段');
        return;
    }
    
        // 显示加载器
        loader.style.display = 'block';
        results.style.display = 'none';
        
        // 模拟API调用
        setTimeout(function() {
            // 隐藏加载器
            loader.style.display = 'none';
            
            // 处理下载链接 (模拟数据)
            const downloadLinks = [
                {
                    url: 'https://example.com/download/private_video.mp4',
                    quality: 'HD (1080p)',
                    size: '28.5 MB',
                    type: 'video/mp4'
                }
            ];
            
            displayResults(results, downloadLinks);
            
            // 清除敏感信息
            passwordInput.value = '';
        }, 3000); // 模拟3秒的API调用
    });
}

// 设置批量下载表单
function setupBatchForm() {
    const form = document.getElementById('batch-form');
    const textarea = document.getElementById('batch-urls');
    const loader = document.getElementById('batch-loader');
    const results = document.getElementById('batch-results');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const urls = textarea.value.trim().split('\n').filter(url => url.trim() !== '');
        
        if (urls.length === 0) {
            showError(results, '请输入至少一个Instagram链接');
            return;
        }
        
        // 显示加载器
        loader.style.display = 'block';
        results.style.display = 'none';
        
        // 模拟API调用
        setTimeout(function() {
            // 隐藏加载器
            loader.style.display = 'none';
            
            // 处理下载链接 (模拟数据)
            const downloadLinks = urls.map((url, index) => {
                return {
                    url: `https://example.com/download/batch_${index + 1}.mp4`,
                    quality: 'HD (1080p)',
                    size: `${Math.floor(Math.random() * 30) + 5}.${Math.floor(Math.random() * 9)}MB`,
                    type: index % 2 === 0 ? 'video/mp4' : 'image/jpeg',
                    originalUrl: url
                };
            });
            
            displayBatchResults(results, downloadLinks);
        }, 4000); // 模拟4秒的API调用
    });
}

// 显示错误信息
function showError(container, message) {
    container.innerHTML = `<div class="error">${message}</div>`;
    container.style.display = 'block';
}

// 显示下载结果
function displayResults(container, links) {
    let html = '';
    
    links.forEach(link => {
        html += `
            <div class="download-item">
                <div class="download-info">
                    <div class="quality">${link.quality}</div>
                    <div class="size">${link.size}</div>
                    <div class="type">${link.type}</div>
                </div>
                <a href="${link.url}" class="download-link" download>
                    <i class="fas fa-download"></i> 下载
                </a>
            </div>
        `;
    });
    
    container.innerHTML = html;
    container.style.display = 'block';
}

// 显示批量下载结果
function displayBatchResults(container, links) {
    let html = '<div class="batch-results">';
    
    links.forEach((link, index) => {
        html += `
            <div class="batch-item">
                <div class="batch-info">
                    <div class="batch-number">${index + 1}</div>
                    <div class="batch-url">${link.originalUrl}</div>
                    <div class="batch-type">${link.type}</div>
                    <div class="batch-size">${link.size}</div>
                </div>
                <a href="${link.url}" class="download-link" download>
                    <i class="fas fa-download"></i> 下载
                </a>
            </div>
        `;
    });
    
    html += '</div>';
    
    html += `
        <div class="batch-actions">
            <a href="#" class="download-all-btn">
                <i class="fas fa-download"></i> 下载全部
            </a>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
    
    // 下载全部按钮事件
    const downloadAllBtn = container.querySelector('.download-all-btn');
    downloadAllBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 在实际应用中，这里应该触发所有链接的下载
        // 由于浏览器安全限制，自动批量下载需要后端支持
        alert('批量下载已开始，请稍候...');
        
        // 模拟点击每个下载链接
        setTimeout(() => {
            const downloadLinks = container.querySelectorAll('.download-link');
            downloadLinks.forEach(link => {
                // 模拟点击
                // 注意：实际使用时，这种方法可能会被浏览器阻止
                // 需要更复杂的后端处理
                window.open(link.href, '_blank');
            });
        }, 500);
    });
}

// 添加实际下载功能
function downloadInstagramContent(url, type, quality) {
    // 此函数应与后端API交互
    // 实际的下载实现需要服务器端支持
    // 这里只是一个示例架构
    
    return new Promise((resolve, reject) => {
        // 创建请求数据
        const requestData = {
            url: url,
            type: type || 'auto',
            quality: quality || 'auto'
        };
        
        // 模拟API调用
        setTimeout(() => {
            // 模拟成功响应
            const response = {
                success: true,
                downloadUrl: 'https://example.com/download/content.mp4',
                quality: 'HD',
                size: '15.2 MB'
            };
            
            resolve(response);
            
            // 如果需要模拟错误:
            // reject(new Error('下载失败，请稍后重试'));
        }, 2000);
    });
} 