#!/bin/bash

# 安装 Chromium 依赖
echo "Installing Chromium and dependencies..."

# 更新包列表
apt-get update

# 安装 Chromium 及其依赖
apt-get install -y \
    chromium-browser \
    chromium-codecs-ffmpeg \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils

echo "Chromium installation complete!"
