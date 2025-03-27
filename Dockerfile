FROM node:16-alpine

# 安装yt-dlp和其依赖
RUN apk add --no-cache python3 py3-pip ffmpeg curl
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 创建下载目录
RUN mkdir -p downloads

EXPOSE 3000

CMD ["npm", "start"] 