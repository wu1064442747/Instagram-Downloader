document.addEventListener('DOMContentLoaded', function() {
    // 获取页面元素
    const downloadBtn = document.getElementById('download-btn');
    const instagramLink = document.getElementById('instagram-link');
    const batchLinks = document.getElementById('batch-links');
    const downloadAllBtn = document.getElementById('download-all');
    const clearLinksBtn = document.getElementById('clear-links');
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    // Cloudflare Worker API 端点
    const API_ENDPOINT = 'https://fastdl.space';
    
    // 单个链接下载
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const link = instagramLink.value.trim();
            if (link) {
                processDownload(link);
            } else {
                showNotification(window.translateApp ? window.translateApp.getText('invalid_link') : '请输入有效的Instagram链接', 'error');
            }
        });
    }
    
    // 批量下载
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', function() {
            const links = batchLinks.value.trim().split('\n').filter(link => link.trim() !== '');
            
            if (links.length > 0) {
                processBatchDownload(links);
            } else {
                showNotification(window.translateApp ? window.translateApp.getText('invalid_links') : '请输入至少一个有效的Instagram链接', 'error');
            }
        });
    }
    
    // 清空链接
    if (clearLinksBtn) {
        clearLinksBtn.addEventListener('click', function() {
            batchLinks.value = '';
        });
    }
    
    // FAQ手风琴效果
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', function() {
            // 关闭其他所有已打开的项
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // 切换当前项的状态
            item.classList.toggle('active');
        });
    });
    
    // 处理单个下载
    function processDownload(link) {
        // 显示加载状态
        showLoadingState();
        
        // 向Worker API发送请求
        fetchDownloadUrl(link)
            .then(data => {
                if (data.success) {
                    // 处理返回的下载信息
                    handleDownloadResponse(data);
                } else {
                    showNotification(data.message || (window.translateApp ? window.translateApp.getText('download_failed') : '下载失败，请检查链接是否有效'), 'error');
                }
            })
            .catch(error => {
                console.error('Download error:', error);
                showNotification(window.translateApp ? window.translateApp.getText('download_error') : '下载过程中发生错误，请稍后重试', 'error');
            })
            .finally(() => {
                // 隐藏加载状态
                hideLoadingState();
            });
    }
    
    // 处理批量下载
    function processBatchDownload(links) {
        showLoadingState();
        
        // 创建一个数组来存储所有promise
        const downloadPromises = links.map(link => fetchDownloadUrl(link));
        
        // 并行处理所有下载请求
        Promise.allSettled(downloadPromises)
            .then(results => {
                const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
                const failed = results.length - successful;
                
                if (successful > 0) {
                    // 创建zip文件或提供批量下载链接
                    createBatchDownloadPackage(results.filter(result => result.status === 'fulfilled' && result.value.success).map(result => result.value));
                    
                    if (window.translateApp) {
                        if (failed > 0) {
                            showNotification(window.translateApp.getText('batch_partial', successful, failed), 'success');
                        } else {
                            showNotification(window.translateApp.getText('batch_success', successful), 'success');
                        }
                    } else {
                        if (failed > 0) {
                            showNotification(`已成功处理 ${successful} 个链接，${failed} 个链接失败`, 'success');
                        } else {
                            showNotification(`已成功处理 ${successful} 个链接`, 'success');
                        }
                    }
                } else {
                    showNotification(window.translateApp ? window.translateApp.getText('batch_failed') : '所有链接处理失败，请检查链接是否有效', 'error');
                }
            })
            .catch(error => {
                console.error('Batch download error:', error);
                showNotification(window.translateApp ? window.translateApp.getText('batch_error') : '批量下载过程中发生错误，请稍后重试', 'error');
            })
            .finally(() => {
                hideLoadingState();
            });
    }
    
    // 发送API请求获取下载链接
    async function fetchDownloadUrl(link) {
        try {
            // 发送请求到Cloudflare Worker API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: link })
            });
            
            // 解析响应
            const data = await response.json();
            
            // 如果API不可用，使用模拟数据（仅开发环境）
            if (!data && process.env.NODE_ENV === 'development') {
                return mockDownloadResponse(link);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            
            // 如果API不可用，使用模拟数据（仅开发环境）
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                return mockDownloadResponse(link);
            }
            
            throw error;
        }
    }
    
    // 模拟API响应（仅开发环境使用）
    function mockDownloadResponse(link) {
        // 判断是否为Instagram链接
        if (isInstagramUrl(link)) {
            // 模拟成功响应
            return {
                success: true,
                type: detectContentType(link),
                url: `https://fastdl.space/download/${Math.random().toString(36).substring(2, 15)}.mp4`,
                thumbnail: 'https://picsum.photos/300/200',
                title: '下载内容 ' + Math.floor(Math.random() * 1000),
                size: Math.floor(Math.random() * 100) + 'MB'
            };
        } else {
            // 模拟失败响应
            return {
                success: false,
                message: '无效的Instagram链接'
            };
        }
    }
    
    // 处理下载响应
    function handleDownloadResponse(data) {
        // 创建下载结果卡片
        const downloadResult = document.createElement('div');
        downloadResult.classList.add('download-result');
        downloadResult.innerHTML = `
            <div class="result-thumbnail">
                <img src="${data.thumbnail}" alt="Thumbnail">
                <span class="result-type">${data.type}</span>
            </div>
            <div class="result-info">
                <h4>${data.title}</h4>
                <p>${window.translateApp ? window.translateApp.getText('file_size') : '文件大小: '}${data.size}</p>
                <a href="${data.url}" class="download-link" download>${window.translateApp ? window.translateApp.getText('download_file') : '下载文件'}</a>
            </div>
        `;
        
        // 显示结果
        const resultContainer = document.createElement('div');
        resultContainer.classList.add('download-results-container');
        
        // 检查是否已存在结果容器
        const existingContainer = document.querySelector('.download-results-container');
        if (existingContainer) {
            existingContainer.prepend(downloadResult);
        } else {
            resultContainer.appendChild(downloadResult);
            document.querySelector('.hero .container').appendChild(resultContainer);
        }
    }
    
    // 创建批量下载包
    function createBatchDownloadPackage(downloadItems) {
        const batchResultsContainer = document.createElement('div');
        batchResultsContainer.classList.add('batch-results-container');
        
        // 添加标题
        const batchTitle = document.createElement('h3');
        batchTitle.textContent = window.translateApp ? window.translateApp.getText('batch_results') : '批量下载结果';
        batchResultsContainer.appendChild(batchTitle);
        
        // 创建结果列表
        const resultsList = document.createElement('div');
        resultsList.classList.add('batch-results-list');
        
        downloadItems.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('batch-result-item');
            resultItem.innerHTML = `
                <div class="result-thumbnail">
                    <img src="${item.thumbnail}" alt="Thumbnail">
                    <span class="result-type">${item.type}</span>
                </div>
                <div class="result-info">
                    <h4>${item.title}</h4>
                    <p>${window.translateApp ? window.translateApp.getText('file_size') : '文件大小: '}${item.size}</p>
                    <a href="${item.url}" class="download-link" download>${window.translateApp ? window.translateApp.getText('download_file') : '下载文件'}</a>
                </div>
            `;
            resultsList.appendChild(resultItem);
        });
        
        batchResultsContainer.appendChild(resultsList);
        
        // 添加"全部下载"按钮
        const downloadAllFilesBtn = document.createElement('button');
        downloadAllFilesBtn.classList.add('primary-btn', 'download-all-files');
        downloadAllFilesBtn.textContent = window.translateApp ? window.translateApp.getText('download_all') : '下载所有文件';
        downloadAllFilesBtn.addEventListener('click', function() {
            downloadItems.forEach(item => {
                const link = document.createElement('a');
                link.href = item.url;
                link.download = item.title;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });
        
        batchResultsContainer.appendChild(downloadAllFilesBtn);
        
        // 显示结果
        const existingContainer = document.querySelector('.batch-results-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // 插入到批量输入区域后面
        const batchInputSection = document.querySelector('.batch-input');
        batchInputSection.parentNode.insertBefore(batchResultsContainer, batchInputSection.nextSibling);
    }
    
    // 显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 显示加载状态
    function showLoadingState() {
        const loading = document.createElement('div');
        loading.classList.add('loading-overlay');
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${window.translateApp ? window.translateApp.getText('download_processing') : '正在处理，请稍候...'}</p>
        `;
        
        document.body.appendChild(loading);
    }
    
    // 隐藏加载状态
    function hideLoadingState() {
        const loading = document.querySelector('.loading-overlay');
        if (loading) {
            loading.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(loading);
            }, 300);
        }
    }
    
    // 判断是否为Instagram链接
    function isInstagramUrl(url) {
        return url.includes('instagram.com') || url.includes('instagr.am');
    }
    
    // 检测内容类型
    function detectContentType(url) {
        if (url.includes('/reel/') || url.includes('/reels/')) {
            return 'Reels';
        } else if (url.includes('/stories/')) {
            return 'Story';
        } else if (url.includes('/p/')) {
            // 模拟随机返回照片或视频
            return Math.random() > 0.5 ? 'Video' : 'Photo';
        } else {
            return 'Content';
        }
    }
    
    // 添加额外的样式
    const style = document.createElement('style');
    style.textContent = `
        .download-results-container, .batch-results-container {
            margin-top: 30px;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: var(--radius);
            padding: 20px;
            box-shadow: var(--shadow);
        }
        
        .download-result, .batch-result-item {
            display: flex;
            margin-bottom: 20px;
            background-color: white;
            border-radius: var(--radius);
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .result-thumbnail {
            position: relative;
            width: 120px;
            min-width: 120px;
            height: 120px;
        }
        
        .result-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .result-type {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: var(--primary-color);
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.8rem;
        }
        
        .result-info {
            padding: 15px;
            flex: 1;
        }
        
        .result-info h4 {
            margin-bottom: 10px;
        }
        
        .result-info p {
            color: var(--light-text);
            margin-bottom: 15px;
        }
        
        .download-link {
            display: inline-block;
            background-color: var(--primary-color);
            color: white;
            padding: 8px 15px;
            border-radius: var(--radius);
            font-weight: 500;
        }
        
        .download-link:hover {
            background-color: var(--secondary-color);
            color: white;
        }
        
        .batch-results-list {
            max-height: 400px;
            overflow-y: auto;
            margin-bottom: 20px;
        }
        
        .download-all-files {
            margin: 0 auto;
            display: block;
        }
        
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: var(--radius);
            color: white;
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .notification-info {
            background-color: var(--primary-color);
        }
        
        .notification-success {
            background-color: #28a745;
        }
        
        .notification-error {
            background-color: #dc3545;
        }
        
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        
        .loading-overlay.fade-out {
            opacity: 0;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 20px;
        }
        
        .loading-overlay p {
            color: white;
            font-size: 1.2rem;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
}); 