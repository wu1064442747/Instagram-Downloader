document.addEventListener('DOMContentLoaded', function() {
    // 初始化语言
    initLanguage();
    
    // 初始化选项卡
    initTabs();
    
    // 初始化FAQ手风琴
    initAccordion();
    
    // 绑定按钮事件
    bindButtonEvents();
    
    // 创建模拟下载功能
    initDownloadProcess();
});

// 语言切换功能
function initLanguage() {
    const languageToggle = document.getElementById('language-toggle');
    
    // 检查当前页面是哪个HTML文件
    const isEnglishPage = window.location.pathname.includes('en.html');
    
    // 语言切换按钮点击事件
    languageToggle.addEventListener('click', function() {
        // 获取目标语言
        const targetLang = this.getAttribute('data-target-lang');
        
        if (targetLang === 'en') {
            // 如果当前是中文页面，切换到英文页面
            window.location.href = 'en.html';
        } else if (targetLang === 'zh') {
            // 如果当前是英文页面，切换到中文页面
            window.location.href = 'index.html';
        }
    });
}

// 下面这些函数在每个HTML页面中分别处理相应语言的内容
// 保留这些函数，但我们不再通过JS动态切换语言，而是通过页面跳转

// 将页面翻译为中文
function translatePageToChinese() {
    // 这个功能现在由中文HTML页面提供
    console.log("中文页面已加载");
}

// 将页面翻译为英文
function translatePageToEnglish() {
    // 这个功能现在由英文HTML页面提供
    console.log("英文页面已加载");
}

// 初始化选项卡
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有选项卡的活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // 设置当前选项卡为活动状态
            this.classList.add('active');
            
            // 根据选项卡内容更新UI或处理逻辑（后续可扩展）
            const tabType = this.getAttribute('data-tab');
            console.log(`Tab selected: ${tabType}`);
        });
    });
}

// 初始化FAQ手风琴
function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', function() {
            // 切换当前项的活动状态
            item.classList.toggle('active');
            
            // 如果需要关闭其他项，可以添加以下代码
            // accordionItems.forEach(otherItem => {
            //     if (otherItem !== item) {
            //         otherItem.classList.remove('active');
            //     }
            // });
        });
    });
}

// 绑定各种按钮事件
function bindButtonEvents() {
    // 检查当前页面语言
    const isEnglishPage = window.location.pathname.includes('en.html');
    
    // 粘贴按钮
    const pasteButton = document.getElementById('paste-button');
    pasteButton.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            const textArea = document.getElementById('instagram-urls');
            textArea.value = textArea.value ? `${textArea.value}\n${text}` : text;
        } catch (err) {
            const errorMsg = isEnglishPage ? 
                'Cannot access clipboard. Please paste content manually.' : 
                '无法访问剪贴板，请手动粘贴内容。';
            alert(errorMsg);
        }
    });
    
    // 清空按钮
    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', function() {
        document.getElementById('instagram-urls').value = '';
    });
    
    // 下载按钮
    const downloadButton = document.getElementById('download-button');
    downloadButton.addEventListener('click', function() {
        const textArea = document.getElementById('instagram-urls');
        const links = textArea.value.trim();
        
        if (!links) {
            const emptyMsg = isEnglishPage ? 
                'Please paste Instagram links first!' : 
                '请先粘贴Instagram链接！';
            alert(emptyMsg);
            return;
        }
        
        const quality = document.getElementById('quality-select').value;
        const format = document.getElementById('format-select').value;
        
        // 执行下载流程
        startDownloadProcess(links, quality, format);
    });
}

// 模拟下载过程
function startDownloadProcess(links, quality, format) {
    // 检查当前页面语言
    const isEnglishPage = window.location.pathname.includes('en.html');
    
    const urlLines = links.split('\n').filter(line => line.trim());
    
    if (urlLines.length === 0) {
        const noLinksMsg = isEnglishPage ? 
            'No valid links found!' : 
            '没有找到有效的链接！';
        alert(noLinksMsg);
        return;
    }
    
    // 显示进度条
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress');
    const progressPercentage = document.querySelector('.progress-percentage');
    const resultsSection = document.getElementById('results');
    const resultsList = document.querySelector('.results-list');
    const batchActions = document.querySelector('.batch-actions');
    
    // 清空之前的结果
    resultsList.innerHTML = '';
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    batchActions.style.display = 'none';
    
    // 确保结果区域可见
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // 模拟进度更新
    let processedCount = 0;
    const totalUrls = urlLines.length;
    
    // 模拟处理时间（实际应用中应该连接到后端API）
    const processInterval = setInterval(() => {
        processedCount++;
        const progress = Math.round((processedCount / totalUrls) * 100);
        
        // 更新进度条
        progressBar.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress}%`;
        
        // 添加一个结果项
        addResultItem(urlLines[processedCount - 1], quality, format);
        
        // 检查是否完成
        if (processedCount >= totalUrls) {
            clearInterval(processInterval);
            progressContainer.style.display = 'none';
            batchActions.style.display = 'flex';
            
            // 绑定批量下载按钮事件
            document.getElementById('download-all').addEventListener('click', function() {
                const batchMsg = isEnglishPage ? 
                    'Batch download started, files will be saved to your download folder.' : 
                    '批量下载已开始，文件将保存到您的下载文件夹。';
                alert(batchMsg);
            });
            
            // 绑定复制全部链接按钮事件
            document.getElementById('copy-all-links').addEventListener('click', function() {
                const downloadLinks = Array.from(document.querySelectorAll('.result-download-link')).map(link => link.href);
                copyToClipboard(downloadLinks.join('\n'));
                
                const copiedMsg = isEnglishPage ? 
                    'All download links have been copied to clipboard!' : 
                    '所有下载链接已复制到剪贴板！';
                alert(copiedMsg);
            });
        }
    }, 800); // 每800毫秒处理一个链接
}

// 添加一个结果项
function addResultItem(url, quality, format) {
    // 从URL中提取信息
    const urlObj = new URL(url);
    let type = 'photo';
    let title = 'Instagram 内容';
    
    // 根据URL确定内容类型
    if (url.includes('/reel/')) {
        type = 'reels';
        title = 'Instagram Reels';
    } else if (url.includes('/stories/')) {
        type = 'story';
        title = 'Instagram Story';
    } else if (url.includes('/p/')) {
        type = 'post';
        title = 'Instagram Post';
    } else if (url.includes('/tv/')) {
        type = 'video';
        title = 'Instagram Video';
    }
    
    // 创建唯一ID
    const id = `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建下载链接（使用当前域名下的API路径）
    const apiBase = window.location.origin;
    const downloadLink = `${apiBase}/api/download?url=${encodeURIComponent(url)}&quality=${quality}&format=${format}`;
    
    // 创建缩略图URL
    const thumbnailUrl = `${apiBase}/api/thumbnail?url=${encodeURIComponent(url)}`;
    
    // 检查当前页面语言
    const isEnglishPage = window.location.pathname.includes('en.html');
    
    // 根据当前页面语言设置按钮文本
    const copyText = isEnglishPage ? 'Copy Link' : '复制链接';
    const downloadText = isEnglishPage ? 'Download' : '下载';
    
    // 创建结果项的HTML
    const resultItemHTML = `
        <div class="result-item" id="${id}">
            <div class="result-thumbnail">
                <img src="${thumbnailUrl}" alt="${title}">
                <div class="result-type">${type.toUpperCase()}</div>
            </div>
            <div class="result-info">
                <div class="result-title">${title}</div>
                <div class="result-actions">
                    <button class="result-button" onclick="copyToClipboard('${downloadLink}')">
                        <i class="fas fa-copy"></i> ${copyText}
                    </button>
                    <a href="${downloadLink}" class="result-button download result-download-link" download>
                        <i class="fas fa-download"></i> ${downloadText}
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // 添加到结果列表
    const resultsList = document.querySelector('.results-list');
    resultsList.insertAdjacentHTML('beforeend', resultItemHTML);
}

// 复制文本到剪贴板
function copyToClipboard(text) {
    // 创建一个临时文本区域
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    
    // 选择并复制文本
    textarea.select();
    document.execCommand('copy');
    
    // 移除临时文本区域
    document.body.removeChild(textarea);
}

// 初始化下载过程（添加全局函数）
function initDownloadProcess() {
    // 将copyToClipboard设为全局可访问
    window.copyToClipboard = copyToClipboard;
} 