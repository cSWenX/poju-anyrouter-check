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

## 安装步骤

### 1. 克隆项目

```bash
git https://github.com/cSWenX/poju-anyrouter-check.git
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动服务

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

## 注意事项

⚠️ **重要提示**:

1. 本项目仅供学习交流使用
2. 请勿用于任何非法用途
3. 使用前请确保已安装 Google Chrome 浏览器
4. macOS 用户需要确认 Chrome 安装路径为 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
5. 其他系统用户需要修改 `server.js` 中的 `executablePath` 配置

## 常见问题

### 1. Chrome 浏览器路径错误

如果遇到 Chrome 路径错误,请修改 `server.js` 中的 `executablePath`:

```javascript
executablePath: '/your/chrome/path'
```

### 2. 端口被占用

如果 3010 端口被占用,可以修改 `server.js` 中的 `PORT` 常量:

```javascript
const PORT = 3010; // 修改为其他端口
```

### 3. Cookie 过期

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
- 浏览器会以非 headless 模式打开
- 可以在控制台查看详细日志

## 更新日志

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
