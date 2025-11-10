# AnyRouter 自动签到系统

一个基于 Node.js + Puppeteer 的 AnyRouter 自动签到打卡系统,支持自动登录、Cookie 持久化和定时任务。

## 功能特性

✅ **全自动化签到**
- 每天早上 6:00 自动签到
- 每两小时自动检查一次
- 支持手动立即签到

✅ **智能登录管理**
- 打开浏览器手动登录一次,系统自动保存登录状态
- 自动提取用户 ID 和 Cookie
- Cookie 过期自动检测并提醒

✅ **多种登录方式**
- 支持 GitHub OAuth 登录
- 支持传统账号密码登录

✅ **完善的数据记录**
- 自动记录每次签到结果
- 显示账户余额变化
- 统计连续签到天数

## 技术栈

- **后端**: Node.js + Express
- **自动化**: Puppeteer
- **数据库**: SQLite3
- **定时任务**: node-cron
- **前端**: 原生 HTML/CSS/JavaScript

## 部署方式

### 方式 1: Zeabur 部署 (推荐 ⭐⭐⭐ 无需信用卡)

Zeabur 提供完全免费的套餐,**无需信用卡验证**,支持中文界面,国内访问快。

#### 1. 准备工作

- 注册 [Zeabur](https://zeabur.com/) 账号 (可用 GitHub 登录)
- 将项目推送到 GitHub

#### 2. 在 Zeabur 部署

1. 访问 [Zeabur Dashboard](https://dash.zeabur.com/)
2. 点击 "创建新项目" → "从 GitHub 导入"
3. 选择仓库 `cSWenX/poju-anyrouter-check`
4. Zeabur 会自动检测并部署

#### 3. 配置持久化存储 (可选)

1. 在服务页面,点击 "服务" → "卷"
2. 点击 "添加卷"
3. 挂载路径设置为 `/data`
4. 添加环境变量: `ZEABUR_VOLUME_DIR=/data`

#### 4. 访问应用

部署完成后,Zeabur 会自动生成访问 URL。

**优势**:
- ✅ 完全免费,无需信用卡
- ✅ 中文界面,操作简单
- ✅ 国内访问速度快
- ✅ 自动 HTTPS
- ✅ Puppeteer 开箱即用

### 方式 2: Render 部署

**注意**: Render 现在需要信用卡验证,即使使用免费套餐。

<details>
<summary>点击展开 Render 部署步骤</summary>

Render 提供免费套餐,支持 Web 服务和持久化存储。

#### 1. 准备工作

- 注册 [Render](https://render.com/) 账号
- **需要绑定信用卡**(免费套餐不扣费)
- 将项目推送到 GitHub

#### 2. 在 Render 部署

1. 访问 [Render Dashboard](https://dashboard.render.com/)
2. 点击 "New +" → "Web Service"
3. 连接你的 GitHub 仓库 `cSWenX/poju-anyrouter-check`
4. 配置如下:
   - **Name**: anyrouter-check (或自定义名称)
   - **Region**: Singapore (新加坡,离中国近)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `chmod +x install-chromium.sh && ./install-chromium.sh && npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

#### 3. 添加环境变量

在 "Environment" 部分添加:
```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

#### 4. 配置持久化存储

1. 在服务页面,找到 "Disks" 部分
2. 点击 "Add Disk"
3. 配置:
   - **Name**: data
   - **Mount Path**: `/data`
   - **Size**: 1 GB (免费套餐)

</details>

### 方式 3: Railway 部署

**注意**: Railway 免费套餐已取消,现在需要付费才能部署 Web 服务。

### 方式 4: 本地部署

#### 1. 克隆项目

```bash
git clone https://github.com/cSWenX/poju-anyrouter-check.git
cd poju-anyrouter-check
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 启动服务

```bash
npm start
```

服务将运行在 `http://localhost:3010`

## 使用说明

### 首次使用

1. **启动服务**: 运行 `npm start` 启动服务器
2. **打开管理界面**: 访问 http://localhost:3010
3. **点击"打开浏览器登录"**: 系统会打开 Chrome 浏览器
4. **手动登录**: 在浏览器中完成 GitHub OAuth 登录或账号密码登录
5. **自动保存**: 登录成功后,系统自动提取并保存用户 ID 和 Cookie
6. **完成**: 关闭浏览器或保持打开,系统将自动定时签到

### 后续使用

- 系统会自动使用保存的 Cookie 进行签到
- 无需再次手动登录
- Cookie 过期后会自动提醒重新登录

## 定时任务说明

- **每天早上 6:00**: 执行一次自动签到
- **每两小时**: 执行一次自动签到检查
  - 具体时间: 00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00

## 项目结构

```
anyrouter-check/
├── server.js              # 主服务器文件
├── package.json           # 项目配置文件
├── zbpack.json            # Zeabur 部署配置 (推荐)
├── render.yaml            # Render 部署配置 (需信用卡)
├── railway.json           # Railway 部署配置 (已停止支持免费套餐)
├── nixpacks.toml          # Nixpacks 构建配置
├── install-chromium.sh    # Chromium 安装脚本 (Render 用)
├── anyrouter.db          # SQLite 数据库(自动生成)
├── public/
│   └── index.html        # 前端管理界面
├── .gitignore            # Git 忽略文件配置
└── README.md             # 项目说明文档
```

## 数据库说明

系统使用 SQLite3 数据库,包含以下表:

- **cookies**: 存储用户 Cookie 和用户 ID
- **check_records**: 存储签到记录
- **user_settings**: 存储用户设置(可选)

## API 接口

- `POST /api/init-login` - 打开浏览器供用户登录
- `GET /api/login-status` - 检查登录状态
- `POST /api/check` - 手动执行签到
- `POST /api/close` - 关闭浏览器
- `GET /api/records` - 获取签到记录
- `GET /api/cookies` - 查看已保存的 Cookie
- `POST /api/clear-cookies` - 清除已保存的 Cookie

## 环境变量

| 变量名 | 说明 | 默认值 | 平台 |
|--------|------|--------|------|
| `PORT` | 服务端口 | 3010 | 所有 |
| `ZEABUR` | Zeabur 环境标识 | - | Zeabur |
| `ZEABUR_VOLUME_DIR` | Zeabur 持久化存储路径 | - | Zeabur |
| `RAILWAY_ENVIRONMENT` | Railway 环境标识 | - | Railway |
| `RAILWAY_VOLUME_MOUNT_PATH` | Railway 持久化存储路径 | - | Railway |
| `RENDER` | Render 环境标识 | - | Render |
| `RENDER_EXTERNAL_DISK` | Render 持久化存储路径 | - | Render |
| `PUPPETEER_EXECUTABLE_PATH` | Chromium 路径 | - | Render |

## 注意事项

⚠️ **重要提示**:

1. 本项目仅供学习交流使用
2. 请勿用于任何非法用途
3. **本地使用**时需要安装 Google Chrome 浏览器
4. **云部署**推荐使用 Zeabur (完全免费,无需信用卡)
5. **Zeabur** Puppeteer 开箱即用,无需额外配置
6. **Render** 需要信用卡验证(免费套餐不扣费)
7. **Railway** 免费套餐已取消,需付费使用
8. macOS 本地开发时 Chrome 路径已自动配置
9. 云部署需要配置 Volume/Disk 来持久化数据库

## 常见问题

### 1. 推荐哪个部署平台?

**推荐 Zeabur**: 完全免费,无需信用卡,中文界面,国内访问快。

### 2. Zeabur 部署后数据丢失

添加持久化存储:
1. 在服务页面,点击 "服务" → "卷"
2. 添加卷,挂载路径 `/data`
3. 添加环境变量 `ZEABUR_VOLUME_DIR=/data`

### 3. Render/Railway 为什么需要信用卡?

- **Render**: 即使免费套餐也需要信用卡验证(不扣费)
- **Railway**: 已取消免费套餐,需要付费
- **建议**: 使用 Zeabur,无需信用卡

### 4. 云部署上无法打开浏览器

云平台运行在 headless 模式,需要:
- 在本地先登录一次获取 Cookie
- 使用 API 导入 Cookie 到云实例

### 5. Chrome 浏览器路径错误(本地)

代码已自动检测环境,本地 macOS 会使用标准路径,其他系统 Puppeteer 会使用自带的 Chromium。

### 6. 端口被占用

云平台会自动分配端口。本地使用时,可以设置环境变量:
```bash
PORT=8080 npm start
```

### 7. Cookie 过期

Cookie 过期后,系统会自动检测并提醒。只需:
1. 点击"打开浏览器登录"
2. 重新登录即可

## 开发说明

### 开发模式

使用 nodemon 实现热重载:

```bash
npm run dev
```

### 调试模式

查看浏览器调试信息:
- 本地浏览器会以非 headless 模式打开
- Railway 上会在日志中显示详细信息
- 可以在控制台查看详细日志

## 更新日志

### v1.3.0 (2025-11-10)

- ✅ 添加 Zeabur 部署支持 (推荐,无需信用卡)
- ✅ 优化部署文档,突出 Zeabur
- ✅ 更新环境检测支持 Zeabur
- ✅ 说明各平台信用卡要求

### v1.2.0 (2025-11-10)

- ✅ 添加 Render 部署支持
- ✅ 创建 Chromium 安装脚本
- ✅ 更新环境检测支持多平台
- ✅ 优化部署文档

### v1.1.0 (2025-11-10)

- ✅ 支持 Railway 部署
- ✅ 自动检测运行环境(本地/Railway)
- ✅ 持久化存储支持
- ✅ 优化 Puppeteer 配置

### v1.0.0 (2025-11-10)

- ✅ 实现自动签到功能
- ✅ 支持 Cookie 持久化
- ✅ 自动提取用户 ID
- ✅ 定时任务:每天 6:00 和每两小时自动签到
- ✅ Web 管理界面
- ✅ 签到记录统计

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request!

## 联系方式

如有问题或建议,请通过 GitHub Issue 联系。
