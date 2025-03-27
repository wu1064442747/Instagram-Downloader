# Instagram Downloader 部署指南

本文档将指导您如何部署 FastDL.space Instagram 下载器，包括前端和后端部分。

## 部署架构

整个应用由两部分组成：
1. 静态前端网站 - 可部署在GitHub Pages或任何静态网站托管服务上
2. Cloudflare Worker后端 - 处理Instagram内容下载逻辑

## 前端部署 (GitHub Pages)

1. Fork本仓库到您的GitHub账户
2. 启用GitHub Pages
   - 进入仓库"Settings" > "Pages"
   - 在"Source"部分，选择"Deploy from a branch"
   - 选择"main"分支和"/(root)"文件夹
   - 点击"Save"
3. 等待几分钟，您的网站将在`https://<your-username>.github.io/instagram-downloader/`上线

## 域名配置 (可选)

如果您希望使用自己的域名 (如 fastdl.space)：

1. 在Cloudflare添加您的域名
   - 创建Cloudflare账户并添加您的域名
   - 更新您的域名服务器为Cloudflare提供的服务器
   - 等待DNS传播完成

2. 配置GitHub Pages自定义域名
   - 仓库"Settings" > "Pages" > "Custom domain"
   - 输入您的域名 (例如 fastdl.space)
   - 点击"Save"
   - 确保"Enforce HTTPS"选项已勾选

3. 在Cloudflare创建DNS记录
   - 类型: CNAME
   - 名称: @ (或您想使用的子域名)
   - 目标: `<your-username>.github.io`
   - 代理状态: 已代理(橙色云朵)

## Cloudflare Worker后端部署

1. 创建Cloudflare账户并设置Workers
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入"Workers & Pages"
   - 点击"Create application" > "Create Worker"

2. 部署Worker脚本
   - 将`worker.js`文件内容粘贴到编辑器中
   - 点击"Save and Deploy"

3. 配置自定义域名 (可选)
   - 在Workers部分，选择您部署的Worker
   - 点击"Triggers" > "Custom Domains"
   - 添加您想要的域名 (例如 instagram-dl.fastdl.space)
   - 完成DNS验证步骤

## 连接前端和后端

1. 更新API端点
   - 打开`js/main.js`文件
   - 找到`API_ENDPOINT`变量
   - 将其值更新为您的Worker URL或自定义域名

```javascript
// 更新这一行
const API_ENDPOINT = 'https://instagram-dl.fastdl.space/';
```

2. 重新部署前端
   - 提交并推送更改到GitHub

## 注意事项

1. **Instagram API限制**:
   - Instagram经常更改其网站结构和API
   - Worker脚本中的提取逻辑可能需要定期更新
   - 某些内容(如Stories)可能需要登录才能访问

2. **跨域资源共享(CORS)**:
   - Worker脚本已配置为允许来自指定域的请求
   - 如果您使用不同的域名，请更新Worker中的`ALLOWED_ORIGINS`数组:

```javascript
const ALLOWED_ORIGINS = [
  'https://your-domain.com',
  'https://www.your-domain.com'
];
```

3. **限制和计费**:
   - Cloudflare Workers有免费和付费计划
   - 免费计划每天允许100,000个请求
   - 监控您的使用情况，以避免意外费用

## 故障排除

如果您在部署过程中遇到问题：

1. **Worker返回错误**:
   - 检查Cloudflare Worker日志
   - 在Worker > Logs查看错误详情

2. **CORS错误**:
   - 确保您已在Worker中正确配置了`ALLOWED_ORIGINS`
   - 检查请求是否来自允许的域名

3. **API端点不可访问**:
   - 验证Worker是否已正确部署
   - 检查自定义域名DNS配置是否正确

4. **内容无法下载**:
   - Instagram可能已更改其网站结构
   - 更新Worker中的提取逻辑
   - 检查是否需要登录才能访问内容

## 更新和维护

定期检查并更新您的Worker脚本，以适应Instagram的变化。您可以通过以下方式保持更新：

1. 关注本仓库获取更新
2. 测试不同类型的Instagram内容
3. 如果发现提取问题，更新Worker中的提取逻辑

## 安全建议

1. 限制API使用：在Worker中实现速率限制，防止滥用
2. 监控使用情况：定期检查Worker使用统计信息
3. 只下载自己的内容：提醒用户仅下载他们有权访问的内容 