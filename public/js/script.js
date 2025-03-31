document.addEventListener('DOMContentLoaded', function() {
    // 初始化手风琴FAQ
    setupAccordion();
    
    // 设置所有下载表单
    setupDownloadForms();
});

// 设置FAQ手风琴效果
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
            
            // 关闭其他展开的项
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this) {
                    otherHeader.classList.remove('active');
                    const otherContent = otherHeader.nextElementSibling;
                    otherContent.style.maxHeight = null;
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
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const url = input.value.trim();
        if (!url) {
            showError(results, 'Please enter a valid Instagram link');
            return;
        }
        
        // 显示加载器
        loader.style.display = 'block';
        results.style.display = 'none';
        
        // 向后端发送请求
        downloadInstagramContent(url, formId.replace('-form', ''), 'auto')
            .then(data => {
                // 隐藏加载器
                loader.style.display = 'none';
                
                if (data.success) {
                    displayResults(results, data.links);
                } else {
                    showError(results, data.message || 'Failed to process the Instagram content');
                }
            })
            .catch(error => {
                loader.style.display = 'none';
                showError(results, 'Error: ' + error.message);
            });
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
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!url || !username || !password) {
            showError(results, 'Please fill in all required fields');
            return;
        }
        
        // 显示加载器
        loader.style.display = 'block';
        results.style.display = 'none';
        
        // 向后端发送请求
        fetch('/api/download/private', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            
            if (data.success) {
                displayResults(results, data.links);
            } else {
                showError(results, data.message || 'Failed to download private content');
            }
        })
        .catch(error => {
            loader.style.display = 'none';
            showError(results, 'Error: ' + error.message);
        });
    });
}

// 设置批量下载表单
function setupBatchForm() {
    const form = document.getElementById('batch-form');
    const urlsTextarea = document.getElementById('batch-urls');
    const loader = document.getElementById('batch-loader');
    const results = document.getElementById('batch-results');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const urlsText = urlsTextarea.value.trim();
        if (!urlsText) {
            showError(results, 'Please enter at least one Instagram link');
            return;
        }
        
        const urls = urlsText.split('\n').filter(url => url.trim() !== '');
        if (urls.length === 0) {
            showError(results, 'Please enter at least one valid Instagram link');
            return;
        }
        
        // 显示加载器
        loader.style.display = 'block';
        results.style.display = 'none';
        
        // 向后端发送请求
        fetch('/api/download/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ urls: urls })
        })
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            
            if (data.success) {
                displayBatchResults(results, data.results);
            } else {
                showError(results, data.message || 'Failed to process batch download');
            }
        })
        .catch(error => {
            loader.style.display = 'none';
            showError(results, 'Error: ' + error.message);
        });
    });
}

// 显示错误消息
function showError(container, message) {
    container.innerHTML = `<div class="error-message">${message}</div>`;
    container.style.display = 'block';
}

// 显示下载结果
function displayResults(container, links) {
    if (!links || links.length === 0) {
        showError(container, 'No download links found');
        return;
    }
    
    let html = '<div class="download-links">';
    
    links.forEach(link => {
        html += `
            <div class="download-link">
                <div class="download-info">
                    <span class="quality">${link.quality || 'Standard'}</span>
                    <span class="size">${link.size || 'Unknown size'}</span>
                    <span class="type">${link.type || 'Unknown type'}</span>
                </div>
                <a href="${link.url}" class="btn-download" download>Download</a>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
}

// 显示批量下载结果
function displayBatchResults(container, results) {
    if (!results || results.length === 0) {
        showError(container, 'No download results found');
        return;
    }
    
    let html = '<div class="batch-results">';
    
    results.forEach(result => {
        if (result.success) {
            html += `
                <div class="batch-item success">
                    <div class="batch-url">${result.url}</div>
                    <div class="batch-links">
            `;
            
            result.links.forEach(link => {
                html += `
                    <div class="download-link">
                        <div class="download-info">
                            <span class="quality">${link.quality || 'Standard'}</span>
                            <span class="size">${link.size || 'Unknown size'}</span>
                        </div>
                        <a href="${link.url}" class="btn-download" download>Download</a>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="batch-item error">
                    <div class="batch-url">${result.url}</div>
                    <div class="error-message">${result.message || 'Failed to process'}</div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
}

// 通过API下载Instagram内容
async function downloadInstagramContent(url, type, quality) {
    // 为了演示目的，我们创建一个模拟实现
    // 在实际应用中，这里应该调用您的后端API
    
    // 由于服务器可能尚未设置，为了让前端显示响应，我们模拟成功响应
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockResponse = {
                success: true,
                links: [
                    {
                        url: `https://example.com/download/instagram_${type}_${Date.now()}.mp4`,
                        quality: 'HD (1080p)',
                        size: '15.2 MB',
                        type: 'video/mp4'
                    }
                ]
            };
            resolve(mockResponse);
        }, 2000);
    });
} 