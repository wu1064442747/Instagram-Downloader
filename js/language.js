document.addEventListener('DOMContentLoaded', function() {
    // 语言数据
    const translations = {
        'zh': {
            // 导航
            'nav_video': '视频下载',
            'nav_reels': 'Reels下载',
            'nav_story': 'Stories下载',
            'nav_photo': '照片下载',
            'nav_audio': '音频下载',
            'nav_private': '私密内容',
            
            // 英雄区
            'hero_title': 'Instagram 下载工具',
            'hero_subtitle': '下载Instagram视频、照片、Reels、Stories、音频 - 快速、免费、无水印',
            'batch_placeholder': '粘贴多个Instagram链接，每行一个...',
            'clear_btn': '清空',
            'batch_download_btn': '批量下载',
            'input_placeholder': '粘贴Instagram链接...',
            'download_btn': '下载',
            
            // 主要功能
            'features_title': '主要功能',
            'video_title': 'Instagram视频下载',
            'video_desc': '支持MP4格式、HD高清、4K超清视频下载',
            'reels_title': 'Instagram Reels下载',
            'reels_desc': '下载短视频、Reels至本地相册',
            'story_title': 'Instagram Story下载',
            'story_desc': '保存故事视频和图片，永久保存珍贵瞬间',
            'photo_title': 'Instagram照片下载',
            'photo_desc': '下载高清无损照片，保存美好回忆',
            'audio_title': 'Instagram音频下载',
            'audio_desc': '提取视频中的MP3音频，保存喜爱的音乐',
            'private_title': '私密内容下载',
            'private_desc': '支持下载自己账号的私密内容',
            
            // 使用步骤
            'how_to_title': '如何使用',
            'step1_title': '复制链接',
            'step1_desc': '在Instagram应用或网页上，点击分享按钮并复制链接',
            'step2_title': '粘贴链接',
            'step2_desc': '将复制的链接粘贴到我们的下载框中',
            'step3_title': '下载内容',
            'step3_desc': '点击"下载"按钮，选择保存位置即可',
            
            // 批量下载
            'batch_title': '批量下载',
            'batch_desc': '一次性下载多个Instagram内容，提高效率',
            'batch_feature1': '快速处理多个链接',
            'batch_feature2': '自动分类保存',
            'batch_feature3': '一键打包下载',
            
            // FAQ
            'faq_title': '常见问题',
            'faq1_q': '什么是Instagram下载工具？',
            'faq1_a': 'Instagram下载工具是一种在线服务，允许您下载Instagram上的视频、照片、Reels、Stories和IGTV内容。FastDL.space是最好的Instagram内容下载工具之一。',
            'faq2_q': '需要登录Instagram账号吗？',
            'faq2_a': '不需要，您无需登录Instagram账号。FastDL.space不要求您提供任何个人信息，确保您可以安全匿名地下载内容。',
            'faq3_q': '这项服务收费吗？',
            'faq3_a': '不，这项服务完全免费，没有下载限制。',
            'faq4_q': '可以下载私密账号的内容吗？',
            'faq4_a': '您只能下载自己私密账号的内容，无法下载其他私密账号的视频、故事或照片。',
            'faq5_q': '支持下载Instagram Stories吗？',
            'faq5_a': '是的，您可以查看并下载自己的Instagram Story。点击Story上的⁝，选择"复制链接"，然后将链接粘贴到FastDL.space进行下载。',
            'faq6_q': '下载的内容保存在哪里？',
            'faq6_a': '通常，视频和照片会保存在Android设备和PC的"下载"文件夹中。在iOS设备上，内容会保存到您的照片库中。',
            
            // 页脚
            'footer_desc': '最快速、最便捷的Instagram内容下载工具。',
            'footer_tools': '工具',
            'footer_support': '支持',
            'footer_faq': '常见问题',
            'footer_contact': '联系我们',
            'footer_legal': '法律信息',
            'footer_terms': '服务条款',
            'footer_privacy': '隐私政策',
            'footer_disclaimer': '我们不隶属于Instagram或Meta。',
            'footer_copyright': '© 2024 FastDL.space. 保留所有权利。',
            
            // 下载相关
            'download_processing': '正在处理，请稍候...',
            'download_results': '下载结果',
            'batch_results': '批量下载结果',
            'file_size': '文件大小: ',
            'download_file': '下载文件',
            'download_all': '下载所有文件',
            'invalid_link': '请输入有效的Instagram链接',
            'invalid_links': '请输入至少一个有效的Instagram链接',
            'download_failed': '下载失败，请检查链接是否有效',
            'download_error': '下载过程中发生错误，请稍后重试',
            'batch_success': '已成功处理 {0} 个链接',
            'batch_partial': '已成功处理 {0} 个链接，{1} 个链接失败',
            'batch_failed': '所有链接处理失败，请检查链接是否有效',
            'batch_error': '批量下载过程中发生错误，请稍后重试'
        },
        'en': {
            // Navigation
            'nav_video': 'Video Download',
            'nav_reels': 'Reels Download',
            'nav_story': 'Stories Download',
            'nav_photo': 'Photo Download',
            'nav_audio': 'Audio Download',
            'nav_private': 'Private Content',
            
            // Hero Section
            'hero_title': 'Instagram Downloader',
            'hero_subtitle': 'Download Instagram Videos, Photos, Reels, Stories, Audio - Fast, Free, No Watermark',
            'batch_placeholder': 'Paste multiple Instagram links, one per line...',
            'clear_btn': 'Clear',
            'batch_download_btn': 'Batch Download',
            'input_placeholder': 'Paste Instagram link...',
            'download_btn': 'Download',
            
            // Features
            'features_title': 'Main Features',
            'video_title': 'Instagram Video Download',
            'video_desc': 'Support MP4 format, HD and 4K ultra-clear video download',
            'reels_title': 'Instagram Reels Download',
            'reels_desc': 'Download short videos and Reels to local gallery',
            'story_title': 'Instagram Story Download',
            'story_desc': 'Save story videos and images, preserve precious moments forever',
            'photo_title': 'Instagram Photo Download',
            'photo_desc': 'Download high-quality lossless photos, save beautiful memories',
            'audio_title': 'Instagram Audio Download',
            'audio_desc': 'Extract MP3 audio from videos, save your favorite music',
            'private_title': 'Private Content Download',
            'private_desc': 'Support downloading private content from your own account',
            
            // How To Use
            'how_to_title': 'How To Use',
            'step1_title': 'Copy Link',
            'step1_desc': 'In Instagram app or website, click the share button and copy link',
            'step2_title': 'Paste Link',
            'step2_desc': 'Paste the copied link into our download box',
            'step3_title': 'Download Content',
            'step3_desc': 'Click the "Download" button and choose where to save',
            
            // Batch Download
            'batch_title': 'Batch Download',
            'batch_desc': 'Download multiple Instagram content at once, improve efficiency',
            'batch_feature1': 'Process multiple links quickly',
            'batch_feature2': 'Auto-categorize and save',
            'batch_feature3': 'One-click package download',
            
            // FAQ
            'faq_title': 'Frequently Asked Questions',
            'faq1_q': 'What is an Instagram Downloader?',
            'faq1_a': 'An Instagram downloader is an online service that allows you to download videos, photos, Reels, Stories, and IGTV content from Instagram. FastDL.space is one of the best tools for downloading your Instagram content.',
            'faq2_q': 'Do I need to log in to my Instagram account?',
            'faq2_a': 'No, you don\'t need to log in to your Instagram account. FastDL.space doesn\'t require any personal information, ensuring you can download content securely and anonymously.',
            'faq3_q': 'Is this service free?',
            'faq3_a': 'Yes, this service is completely free with no download limits.',
            'faq4_q': 'Can I download content from private accounts?',
            'faq4_a': 'You can only download content from your own private account, not from other private accounts.',
            'faq5_q': 'Do you support downloading Instagram Stories?',
            'faq5_a': 'Yes, you can view and download your own Instagram Story. Click ⁝ on the story, select "Copy Link", and paste the link into FastDL.space to download it.',
            'faq6_q': 'Where are my downloads saved?',
            'faq6_a': 'Typically, videos and photos are saved in the "Downloads" folder on Android devices and PCs. On iOS devices, content will be saved to your photo library.',
            
            // Footer
            'footer_desc': 'The fastest and most convenient Instagram content download tool.',
            'footer_tools': 'Tools',
            'footer_support': 'Support',
            'footer_faq': 'FAQ',
            'footer_contact': 'Contact Us',
            'footer_legal': 'Legal',
            'footer_terms': 'Terms of Service',
            'footer_privacy': 'Privacy Policy',
            'footer_disclaimer': 'We are not affiliated with Instagram or Meta.',
            'footer_copyright': '© 2024 FastDL.space. All rights reserved.',
            
            // Download Related
            'download_processing': 'Processing, please wait...',
            'download_results': 'Download Results',
            'batch_results': 'Batch Download Results',
            'file_size': 'File size: ',
            'download_file': 'Download File',
            'download_all': 'Download All Files',
            'invalid_link': 'Please enter a valid Instagram link',
            'invalid_links': 'Please enter at least one valid Instagram link',
            'download_failed': 'Download failed, please check if the link is valid',
            'download_error': 'An error occurred during download, please try again later',
            'batch_success': 'Successfully processed {0} links',
            'batch_partial': 'Successfully processed {0} links, {1} links failed',
            'batch_failed': 'All links processing failed, please check if the links are valid',
            'batch_error': 'An error occurred during batch download, please try again later'
        }
    };
    
    // 获取语言选择器元素
    const languageSelector = document.getElementById('language-selector');
    
    // 获取用户首选语言
    let currentLanguage = localStorage.getItem('preferred_language') || 'zh';
    
    // 设置语言选择器的初始值
    if (languageSelector) {
        languageSelector.value = currentLanguage;
    }
    
    // 应用初始语言
    applyLanguage(currentLanguage);
    
    // 监听语言切换事件
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            currentLanguage = this.value;
            localStorage.setItem('preferred_language', currentLanguage);
            applyLanguage(currentLanguage);
        });
    }
    
    // 应用语言到页面
    function applyLanguage(lang) {
        if (!translations[lang]) {
            console.error('Language not supported:', lang);
            return;
        }
        
        // 更新导航菜单
        updateElementText('nav_video', lang);
        updateElementText('nav_reels', lang);
        updateElementText('nav_story', lang);
        updateElementText('nav_photo', lang);
        updateElementText('nav_audio', lang);
        updateElementText('nav_private', lang);
        
        // 更新英雄区
        updateElementText('hero_title', lang);
        updateElementText('hero_subtitle', lang);
        updatePlaceholder('batch-links', 'batch_placeholder', lang);
        updateElementText('clear-links', 'clear_btn', lang);
        updateElementText('download-all', 'batch_download_btn', lang);
        updatePlaceholder('instagram-link', 'input_placeholder', lang);
        updateElementText('download-btn', 'download_btn', lang);
        
        // 更新特性区
        updateElementText('features_title', lang);
        updateElementText('video_title', lang);
        updateElementText('video_desc', lang);
        updateElementText('reels_title', lang);
        updateElementText('reels_desc', lang);
        updateElementText('story_title', lang);
        updateElementText('story_desc', lang);
        updateElementText('photo_title', lang);
        updateElementText('photo_desc', lang);
        updateElementText('audio_title', lang);
        updateElementText('audio_desc', lang);
        updateElementText('private_title', lang);
        updateElementText('private_desc', lang);
        
        // 更新使用步骤
        updateElementText('how_to_title', lang);
        updateElementText('step1_title', lang);
        updateElementText('step1_desc', lang);
        updateElementText('step2_title', lang);
        updateElementText('step2_desc', lang);
        updateElementText('step3_title', lang);
        updateElementText('step3_desc', lang);
        
        // 更新批量下载
        updateElementText('batch_title', lang);
        updateElementText('batch_desc', lang);
        updateElementText('batch_feature1', lang);
        updateElementText('batch_feature2', lang);
        updateElementText('batch_feature3', lang);
        
        // 更新FAQ
        updateElementText('faq_title', lang);
        updateElementText('faq1_q', lang);
        updateElementText('faq1_a', lang);
        updateElementText('faq2_q', lang);
        updateElementText('faq2_a', lang);
        updateElementText('faq3_q', lang);
        updateElementText('faq3_a', lang);
        updateElementText('faq4_q', lang);
        updateElementText('faq4_a', lang);
        updateElementText('faq5_q', lang);
        updateElementText('faq5_a', lang);
        updateElementText('faq6_q', lang);
        updateElementText('faq6_a', lang);
        
        // 更新页脚
        updateElementText('footer_desc', lang);
        updateElementText('footer_tools', lang);
        updateElementText('footer_support', lang);
        updateElementText('footer_faq', lang);
        updateElementText('footer_contact', lang);
        updateElementText('footer_legal', lang);
        updateElementText('footer_terms', lang);
        updateElementText('footer_privacy', lang);
        updateElementText('footer_disclaimer', lang);
        updateElementText('footer_copyright', lang);
        
        // 更新动态生成的内容
        updateDynamicContent(lang);
    }
    
    // 更新元素文本
    function updateElementText(elemId, lang) {
        const element = document.getElementById(elemId);
        if (element && translations[lang][elemId]) {
            element.textContent = translations[lang][elemId];
        }
        
        // 也处理使用类名选择的元素
        const elements = document.querySelectorAll('.' + elemId);
        if (elements.length > 0 && translations[lang][elemId]) {
            elements.forEach(el => {
                el.textContent = translations[lang][elemId];
            });
        }
    }
    
    // 更新输入框占位符
    function updatePlaceholder(elemId, translationKey, lang) {
        const element = document.getElementById(elemId);
        if (element && translations[lang][translationKey]) {
            element.placeholder = translations[lang][translationKey];
        }
    }
    
    // 格式化字符串
    function formatString(str, ...args) {
        return str.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    }
    
    // 更新动态生成的内容
    function updateDynamicContent(lang) {
        // 更新下载结果区域
        const downloadResultsContainer = document.querySelector('.download-results-container');
        if (downloadResultsContainer) {
            const downloadLinks = downloadResultsContainer.querySelectorAll('.download-link');
            downloadLinks.forEach(link => {
                link.textContent = translations[lang]['download_file'];
            });
            
            // 更新文件大小标签
            const fileSizeLabels = downloadResultsContainer.querySelectorAll('.result-info p');
            fileSizeLabels.forEach(label => {
                const size = label.textContent.split(':')[1].trim();
                label.textContent = translations[lang]['file_size'] + size;
            });
        }
        
        // 更新批量下载结果区域
        const batchResultsContainer = document.querySelector('.batch-results-container');
        if (batchResultsContainer) {
            // 更新标题
            const batchTitle = batchResultsContainer.querySelector('h3');
            if (batchTitle) {
                batchTitle.textContent = translations[lang]['batch_results'];
            }
            
            // 更新下载链接
            const downloadLinks = batchResultsContainer.querySelectorAll('.download-link');
            downloadLinks.forEach(link => {
                link.textContent = translations[lang]['download_file'];
            });
            
            // 更新文件大小标签
            const fileSizeLabels = batchResultsContainer.querySelectorAll('.result-info p');
            fileSizeLabels.forEach(label => {
                const size = label.textContent.split(':')[1].trim();
                label.textContent = translations[lang]['file_size'] + size;
            });
            
            // 更新"下载所有"按钮
            const downloadAllBtn = batchResultsContainer.querySelector('.download-all-files');
            if (downloadAllBtn) {
                downloadAllBtn.textContent = translations[lang]['download_all'];
            }
        }
        
        // 更新加载中提示
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('p');
            if (loadingText) {
                loadingText.textContent = translations[lang]['download_processing'];
            }
        }
    }
    
    // 暴露翻译函数到全局，便于其他脚本使用
    window.translateApp = {
        getText: function(key, ...args) {
            if (!translations[currentLanguage] || !translations[currentLanguage][key]) {
                console.warn('Translation key not found:', key);
                return key;
            }
            
            const text = translations[currentLanguage][key];
            return args.length > 0 ? formatString(text, ...args) : text;
        },
        getCurrentLanguage: function() {
            return currentLanguage;
        }
    };
}); 