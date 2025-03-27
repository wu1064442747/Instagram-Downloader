#!/bin/bash

# 创建目录结构
mkdir -p css
mkdir -p js
mkdir -p img

echo "目录结构已创建完成。"

# 检查是否存在必要文件
if [ ! -f "index.html" ]; then
    echo "警告: index.html 文件不存在!"
fi

if [ ! -f "css/style.css" ]; then
    echo "警告: css/style.css 文件不存在!"
fi

if [ ! -f "js/main.js" ]; then
    echo "警告: js/main.js 文件不存在!"
fi

if [ ! -f "js/language.js" ]; then
    echo "警告: js/language.js 文件不存在!"
fi

# 如果尚未初始化git仓库，则初始化
if [ ! -d ".git" ]; then
    echo "初始化git仓库..."
    git init
    git add .
    git commit -m "初始提交"
fi

echo "安装脚本完成。您现在可以启动一个本地服务器来测试网站。"
echo "例如，您可以运行: python -m http.server 8000"
echo "然后在浏览器中访问: http://localhost:8000" 