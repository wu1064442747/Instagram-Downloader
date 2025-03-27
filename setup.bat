@echo off
echo 创建目录结构...

:: 创建目录结构
if not exist css mkdir css
if not exist js mkdir js
if not exist img mkdir img

echo 目录结构已创建完成。

:: 检查是否存在必要文件
if not exist index.html echo 警告: index.html 文件不存在!
if not exist css\style.css echo 警告: css\style.css 文件不存在!
if not exist js\main.js echo 警告: js\main.js 文件不存在!
if not exist js\language.js echo 警告: js\language.js 文件不存在!

:: 如果尚未初始化git仓库，则初始化
if not exist .git (
    echo 初始化git仓库...
    git init
    git add .
    git commit -m "初始提交"
)

echo 安装脚本完成。您现在可以启动一个本地服务器来测试网站。
echo 例如，您可以运行: python -m http.server 8000
echo 然后在浏览器中访问: http://localhost:8000 