# AnyRouter 登录调试日志

生成时间: 11/6/2025, 1:30:45 AM

## 步骤 1: 访问网站

正在访问 https://anyrouter.top

## 初始页面URL

`https://anyrouter.top/login`

## 登录后URL

`https://anyrouter.top/login`

## 页面余额元素

未找到包含 $ 的元素

## Cookies 信息

```json
[
  {
    "name": "session",
    "domain": "anyrouter.top",
    "path": "/",
    "secure": false,
    "httpOnly": true
  },
  {
    "name": "acw_sc__v2",
    "domain": ".anyrouter.top",
    "path": "/",
    "secure": false,
    "httpOnly": false
  },
  {
    "name": "cdn_sec_tc",
    "domain": "anyrouter.top",
    "path": "/",
    "secure": false,
    "httpOnly": true
  },
  {
    "name": "acw_tc",
    "domain": "anyrouter.top",
    "path": "/",
    "secure": false,
    "httpOnly": true
  }
]
```

## 所有API请求

```json
[
  {
    "url": "https://anyrouter.top/api/status",
    "method": "GET",
    "headers": {
      "new-api-user": "-1",
      "sec-ch-ua-platform": "\"macOS\"",
      "cache-control": "no-store",
      "referer": "https://anyrouter.top/",
      "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "accept": "application/json, text/plain, */*"
    },
    "timestamp": "2025-11-05T17:30:46.610Z"
  },
  {
    "url": "https://anyrouter.top/api/status",
    "method": "GET",
    "headers": {
      "new-api-user": "-1",
      "sec-ch-ua-platform": "\"macOS\"",
      "cache-control": "no-store",
      "referer": "https://anyrouter.top/login",
      "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "accept": "application/json, text/plain, */*"
    },
    "timestamp": "2025-11-05T17:30:46.876Z"
  },
  {
    "url": "https://anyrouter.top/api/notice",
    "method": "GET",
    "headers": {
      "new-api-user": "-1",
      "sec-ch-ua-platform": "\"macOS\"",
      "cache-control": "no-store",
      "referer": "https://anyrouter.top/login",
      "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "accept": "application/json, text/plain, */*"
    },
    "timestamp": "2025-11-05T17:30:46.877Z"
  },
  {
    "url": "https://anyrouter.top/api/notice",
    "method": "GET",
    "headers": {
      "new-api-user": "-1",
      "sec-ch-ua-platform": "\"macOS\"",
      "cache-control": "no-store",
      "referer": "https://anyrouter.top/login",
      "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "accept": "application/json, text/plain, */*"
    },
    "timestamp": "2025-11-05T17:30:46.892Z"
  },
  {
    "url": "https://anyrouter.top/api/oauth/state",
    "method": "GET",
    "headers": {
      "new-api-user": "-1",
      "sec-ch-ua-platform": "\"macOS\"",
      "cache-control": "no-store",
      "referer": "https://anyrouter.top/login",
      "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "accept": "application/json, text/plain, */*"
    },
    "timestamp": "2025-11-05T17:31:30.592Z"
  }
]
```

## 所有API响应

### 1. https://anyrouter.top/api/status

- 状态码: 200
- 时间: 2025-11-05T17:30:46.879Z
- 数据:
```json
{
  "data": {
    "announcements": [
      {
        "content": "主站域名可能被 DNS 污染，目前新增域名 q.quuvv.cn，后续请随时关注控制台上的 API 信息",
        "extra": "",
        "id": 21,
        "publishDate": "2025-10-06T08:14:35.556Z",
        "type": "default"
      },
      {
        "content": "Claude Sonnet 4.5 模型现已发布，使用 npm i -g @anthropic-ai/claude-code 更新最新版本 Claude Code 并使用 /model 选择 sonnet 4.5 体验最新模型",
        "extra": "",
        "id": 20,
        "publishDate": "2025-09-29T17:19:35.166Z",
        "type": "default"
      },
      {
        "content": "gpt-5-codex 因配置问题导致出现较多 429 错误，现已恢复",
        "extra": "",
        "id": 19,
        "publishDate": "2025-09-22T06:34:51.158Z",
        "type": "default"
      },
      {
        "content": "新增 codex 支持（当前仅支持 gpt-5-codex 模型），请查阅使用指南了解详情",
        "extra": "",
        "id": 18,
        "publishDate": "2025-09-21T14:21:13.851Z",
        "type": "default"
      },
      {
        "content": "目前已适配 Claude Code 1m 上下文，使用 /model sonnet[1m] 开启",
        "extra": "",
        "id": 17,
        "publishDate": "2025-09-12T03:23:34.427Z",
        "type": "default"
      },
      {
        "content": "当前提供 gemini-2.5-pro ，未来将支持更多模型。",
        "extra": "",
        "id": 16,
        "publishDate": "2025-08-22T04:00:00.000Z",
        "type": "default"
      },
      {
        "content": "为保障服务质量，本站暂时停止来自 Github 账号的新用户注册；来自 Linux Do 账号的注册以及所有已注册用户的登录均不受影响。用户每日签到获赠额度提升至 $25。",
        "extra": "",
        "id": 14,
        "publishDate": "2025-07-14T18:26:10.983Z",
        "type": "success"
      },
      {
        "content": "我们仍在持续遭受攻击，正在修复",
        "extra": "",
        "id": 13,
        "publishDate": "2025-07-14T03:33:57.014Z",
        "type": "default"
      },
      {
        "content": "网站受到持续攻击，可能出现无法访问的情况，正在修复",
        "extra": "",
        "id": 12,
        "publishDate": "2025-07-13T11:00:00.000Z",
        "type": "default"
      },
      {
        "content": "用户余额变动产生的垃圾日志把磁盘写满导致API请求失败，已恢复并配置自动删除",
        "extra": "",
        "id": 11,
        "publishDate": "2025-07-13T09:30:00.000Z",
        "type": "default"
      },
      {
        "content": "22:15 分开始由于内存耗尽出现服务器崩溃现象，目前已经完成重启",
        "extra": "",
        "id": 10,
        "publishDate": "2025-07-12T14:32:16.931Z",
        "type": "default"
      },
      {
        "content": "今天上游网络压力较大，目前已经做了调整，使用应该会比较稳定",
        "extra": "",
        "id": 9,
        "publishDate": "2025-07-11T05:47:19.018Z",
        "type": "default"
      },
      {
        "content": "新增了签到功能，每日打开平台前端可以获赠 $10 额度",
        "extra": "",
        "id": 8,
        "publishDate": "2025-07-10T11:04:05.320Z",
        "type": "default"
      },
      {
        "content": "很多用户反馈遇到 “无效的令牌” 错误，经过检查日志发现这些请求的令牌并非从网站上获取的令牌，遇到此错误的用户可以对照使用指南检查自己的步骤，正确的令牌应该形如 sk-xxxxxxxx",
        "extra": "",
        "id": 7,
        "publishDate": "2025-07-10T08:45:28.582Z",
        "type": "default"
      },
      {
        "content": "今天出现了较多的 “请求上游地址失败” 的错误，已经采取措施进行了优化，遇到错误可以多重试几次",
        "extra": "",
        "id": 6,
        "publishDate": "2025-07-10T07:28:48.929Z",
        "type": "default"
      },
      {
        "content": "发现在一些情况下会出现计费错误，即令牌显示的用量比用户页面显示的多，而且剩余额度比较低的情况，具体计费 bug 原因不完全确定，但是准备了脚本修正错误剩余额度，各位用户可以放心使用",
        "extra": "",
        "id": 5,
        "publishDate": "2025-07-08T07:43:28.926Z",
        "type": "default"
      },
      {
        "content": "过去一小时中遇到网络问题导致 API 请求失败，目前已恢复",
        "extra": "",
        "id": 4,
        "publishDate": "2025-07-08T04:55:38.102Z",
        "type": "default"
      },
      {
        "content": "3. 在没有检测到滥用的情况下本站不会随意封禁用户，如果是网站问题导致的不可用，会在解决问题后发布公告",
        "extra": "",
        "id": 3,
        "publishDate": "2025-07-08T04:01:22.962Z",
        "type": "default"
      },
      {
        "content": "各位用户好，关注到网络上关于本站运行情况的一些讨论，目前做出如下回应：\n1. 本站将会尽力而为提供公益服务，没有收费计划，但是目前高峰期确实会超出承载能力导致较多的请求失败，敬请谅解\n2. 本站目前没有任何官方群，也没有授权任何人以本站名义建立群聊，请各位用户谨防受骗",
        "extra": "",
        "id": 2,
        "publishDate": "2025-07-08T04:00:30.342Z",
        "type": "default"
      },
      {
        "content": "短时间内出现较多 403 错误，目前已经修复",
        "extra": "",
        "id": 1,
        "publishDate": "2025-07-06T07:40:13.220Z",
        "type": "default"
      }
    ],
    "api_info": [
      {
        "color": "blue",
        "description": "主站后端直连服务",
        "id": 1,
        "route": "大陆网络优化",
        "url": "https://q.quuvv.cn"
      },
      {
        "color": "blue",
        "description": "针对中国大陆地区优化的后端服务",
        "id": 2,
        "route": "大陆优化 CDN",
        "url": "https://pmpjfbhq.cn-nb1.rainapp.top"
      },
      {
        "color": "blue",
        "description": "主站后端直连服务",
        "id": 3,
        "route": "大陆网络优化",
        "url": "https://anyrouter.top"
      }
    ],
    "chats": [
      {
        "ChatGPT Next Web 官方示例": "https://app.nextchat.dev/#/?settings={\"key\":\"{key}\",\"url\":\"{address}\"}"
      },
      {
        "Lobe Chat 官方示例": "https://chat-preview.lobehub.com/?settings={\"keyVaults\":{\"openai\":{\"apiKey\":\"{key}\",\"baseURL\":\"{address}/v1\"}}}"
      },
      {
        "AI as Workspace": "https://aiaw.app/set-provider?provider={\"type\":\"openai\",\"settings\":{\"apiKey\":\"{key}\",\"baseURL\":\"{address}/v1\",\"compatibility\":\"strict\"}}"
      },
      {
        "AMA 问天": "ama://set-api-key?server={address}&key={key}"
      },
      {
        "OpenCat": "opencat://team/join?domain={address}&token={key}"
      }
    ],
    "data_export_default_time": "hour",
    "default_collapse_sidebar": false,
    "demo_site_enabled": false,
    "display_in_currency": true,
    "docs_link": "https://docs.anyrouter.top",
    "email_verification": true,
    "enable_batch_update": false,
    "enable_data_export": true,
    "enable_drawing": false,
    "enable_online_topup": false,
    "enable_task": true,
    "faq": [
      {
        "content": "本站直接接入官方 Claude Code 转发，无法转发非 Claude Code 的 API 流量",
        "id": 1,
        "title": "为什么无法在第三方应用中使用 AnyRouter API Key"
      },
      {
        "content": "这表明 Claude Code 没有检测到 ANTHROPIC_AUTH_TOKEN 和 ANTHROPIC_BASE_URL 环境变量，检查环境变量是否配好。",
        "id": 2,
        "title": "Invalid API Key · Please run /login 怎么解决？"
      },
      {
        "content": "Claude Code 会通过检查是否能连接到 Google 来对网络状态进行判断。显示 offline 并不影响正常使用 Claude Code，只是表明 Claude Code 未能连接 Google。",
        "id": 3,
        "title": "显示 offline 是什么原因？"
      },
      {
        "content": "这是因为 Claude Code 在访问网页前会调用 Anthropic 的服务来判断网页是否可以访问。需要保持国际互联网连接并进行全局代理，才可以访问 Anthropic 用来判断网页是否可以访问的服务。",
        "id": 4,
        "title": "为什么浏览网页的 Fetch 会失败？"
      },
      {
        "content": "可能是因为所在地区的网络环境导致的，可以尝试使用代理工具或者使用备用 API 端点 ANTHROPIC_BASE_URL=https://pmpjfbhq.cn-nb1.rainapp.top",
        "id": 5,
        "title": "为什么请求总是显示 fetch failed？"
      }
    ],
    "footer_html": "",
    "github_client_id": "Ov23liOwlnIiYoF3bUqw",
    "github_oauth": true,
    "linuxdo_client_id": "8w2uZtoWH9AUXrZr1qeCEEmvXLafea3c",
    "linuxdo_oauth": true,
    "logo": "",
    "min_topup": 1,
    "mj_notify_enabled": false,
    "oidc_authorization_endpoint": "",
    "oidc_client_id": "",
    "oidc_enabled": false,
    "price": 7.3,
    "quota_per_unit": 500000,
    "self_use_mode_enabled": false,
    "server_address": "https://anyrouter.top",
    "setup": true,
    "start_time": 1762308422,
    "system_name": "Any Router",
    "telegram_bot_name": "",
    "telegram_oauth": false,
    "top_up_link": "",
    "turnstile_check": false,
    "turnstile_site_key": "",
    "version": "v0.0.0",
    "wechat_login": false,
    "wechat_qrcode": ""
  },
  "message": "",
  "success": true
}
```

### 2. https://anyrouter.top/api/notice

- 状态码: 200
- 时间: 2025-11-05T17:30:46.892Z
- 数据:
```json
{
  "data": "<br />\n<center style=\"font-size: 3em\"><b>🚀快速开始</b></center>\n<br /><br />\n\n<center style=\"font-size: 1.5em\"><b>点击右上角 系统公告🔔 可再次查看 ｜ 完整内容可参考<a href=\"https://docs.anyrouter.top\" style=\"color: blue;\" target=\"_blank\">使用文档</a></b></center>\n\n<br /><br />\n<span style=\"font-size: 1.5em\">❗️提示</span>\n<br /><br />\n[2025/09/30] Claude Sonnet 4.5 模型现已发布，使用 npm i -g @anthropic-ai/claude-code 更新最新版本 Claude Code 并使用 /model 选择 sonnet 4.5 体验最新模型\n<br /><br />\n[2025/07/27] 本站目前试验性开放邮箱登录，为防止滥用，当前仅允许 *.edu.cn 后缀邮箱注册，发送邮件可能有一定的延迟，也可能被识别为垃圾邮件，请注意检查\n<br /><br />\n[2025/07/16] 由于持续遭受攻击，本站停止服务一天，请关注后续通知。另外本站从未官方或授权其他人建立群聊、发布教程等，除官网所示备用 API 域名外也没有建立其他 AnyRouter 或近似名称的镜像站，请注意避免受到欺骗\n<br /><br />\n[2025/07/15] 此前的封禁中有一条错误的规则导致很多用户正常通过 GitHub 登录会遭遇封禁，现在已经找到了问题并进行了修复，烦请各位用户通过自助解封功能恢复账号，造成不便敬请谅解\n<br /><br />\n[2025/07/15] 根据启发式规则封禁了部分用户。后续将提供自助解除封禁的功能，目前管理员无法对所有此类邮件进行回复，请耐心等待\n<br /><br />\n[2025/07/15] 本站日前遭遇了大量攻击和滥用。为保障服务质量，本站暂时停止来自 Github 账号的新用户注册；来自 Linux Do 账号的注册以及所有已注册用户的登录均不受影响。\n\n\n<br /><br />\n<span style=\"font-size: 1.5em\"> 1️⃣ 安装 Node.js（已安装可跳过）</span>\n<br /><br />\n确保 Node.js 版本 ≥ 18.0\n\n```bash\n# Ubuntu / Debian 用户\ncurl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -\nsudo apt-get install -y nodejs\nnode --version\n\n# macOS 用户\nsudo xcode-select --install\n/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"\nbrew install node\nnode --version\n```\n\n<br /><br />\n<span style=\"font-size: 1.5em\">2️⃣ 安装 Claude Code</span>\n<br /><br />\n```bash\nnpm install -g @anthropic-ai/claude-code\nclaude --version\n```\n<br /><br />\n<span style=\"font-size: 1.5em\">3️⃣ 开始使用</span>\n<br /><br />\n- **获取 Auth Token：** `ANTHROPIC_AUTH_TOKEN` ：注册后在 `API令牌` 页面点击 `添加令牌` 获得（以 `sk-` 开头）\n  - 名称随意，额度建议设为无限额度，其他保持默认设置即可\n\n<br />\n\n- **API地址：** `ANTHROPIC_BASE_URL`：`https://anyrouter.top` 是本站的 API 服务地址，**与主站地址相同**\n\n<br />\n在您的项目目录下运行：\n<br />\n\n```bash\ncd your-project-folder\nexport ANTHROPIC_AUTH_TOKEN=sk-... \nexport ANTHROPIC_BASE_URL=https://anyrouter.top\nclaude\n```\n\n<br />\n运行后\n\n- 选择你喜欢的主题 + Enter\n- 确认安全须知 + Enter\n- 使用默认 Terminal 配置 + Enter\n- 信任工作目录 + Enter\n\n<br />\n开始在终端里和你的 AI 编程搭档一起写代码吧！🚀\n\n<br /><br />\n\n<span style=\"font-size: 1.5em\">4️⃣ 配置环境变量（推荐）</span>\n<br /><br />\n为避免每次重复输入，可将环境变量写入 bash_profile 和 bashrc：\n<br />\n```bash\necho -e '\\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.bash_profile\necho -e '\\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.bash_profile\necho -e '\\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.bashrc\necho -e '\\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.bashrc\necho -e '\\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.zshrc\necho -e '\\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.zshrc\n```\n<br />\n重启终端后，直接使用：\n<br />\n\n```bash\ncd your-project-folder\nclaude\n```\n\n<br />\n即可使用 Claude Code\n\n<br /><br />\n\n<span style=\"font-size: 1.5em\"> 💡 OpenAI Codex 使用方式 </span>\n<br /><br />\n<span style=\"font-size: 1.5em\"> 1️⃣ 安装 Node.js</span>\n<br /><br />\n与 Claude Code 步骤 1️⃣ 相同\n<br /><br />\n<span style=\"font-size: 1.5em\"> 2️⃣ 安装 codex </span>\n<br /><br />\n```bash\nnpm i -g @openai/codex\ncodex --version\n```\n<br /><br />\n<span style=\"font-size: 1.5em\"> 3️⃣ 开始使用 </span>\n<br /><br />\n- **获取 Auth Token：** 注册后在 `API令牌` 页面点击 `添加令牌` 获得（以 `sk-` 开头）\n  - 名称随意，额度建议设为无限额度，其他保持默认设置即可\n<br /><br />\n- 创建 `~/.codex/config.toml` 文件，并添加如下配置：\n```toml\nmodel = \"gpt-5-codex\"\nmodel_provider = \"anyrouter\"\npreferred_auth_method = \"apikey\"\n\n\n[model_providers.anyrouter]\nname = \"Any Router\"\nbase_url = \"https://anyrouter.top/v1\"\nwire_api = \"responses\"\n```\n- 创建 `~/.codex/auth.json` 文件，并添加如下配置：\n```json\n{\n  \"OPENAI_API_KEY\":\"这里换成你申请的 KEY\"\n}\n```\n<br /><br />\n⚠️ 上述配置文件的路径 `~/.codex` 也可以用 `CODEX_HOME` 环境变量指定\n<br /><br />\n在您的项目目录下运行：\n<br />\n\n```bash\ncd your-project-folder\ncodex\n```\n\n\n<br /><br />\n\n<span style=\"font-size: 1.5em\"> ❓FAQ </span>\n<br /><br />\n\n- 本站直接接入官方 Claude Code 转发，无法转发非 Claude Code 的 API 流量\n<br /><br />\n- 如遇 API 报错，可能是转发代理不稳定导致，可以考虑退出 Claude Code 重试几次\n<br /><br />\n- 如果网页遇到登录错误可以尝试清除本站的 Cookie，重新登录\n<br /><br />\n- `Invalid API Key  · Please run /login` 怎么解决？这表明 Claude Code 没有检测到 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_BASE_URL` 环境变量，检查环境变量是否配好。\n<br /><br />\n- 显示 `offline` 是什么原因？Claude Code 会通过检查是否能连接到 Google 来对网络进行判断。显示 `offline` 并不影响正常使用 Claude Code，只是表明 Claude Code 未能连接 Google。\n<br /><br />\n- 为什么浏览网页的 Fetch 会失败？这是因为 Claude Code 在访问网页前会调用 Claude 的服务来判断网页是否可以访问。需要保持国际互联网连接并进行全局代理，才可以访问 Claude 判断网页是否可以访问的服务。\n<br /><br />\n- 为什么请求总是显示 fetch failed？可能是因为所在地区的网络环境导致的，可以尝试使用代理工具或者使用备用 API 端点 `ANTHROPIC_BASE_URL=https://pmpjfbhq.cn-nb1.rainapp.top`",
  "message": "",
  "success": true
}
```

### 3. https://anyrouter.top/api/notice

- 状态码: 200
- 时间: 2025-11-05T17:30:46.950Z
- 数据:
```json
{
  "data": "<br />\n<center style=\"font-size: 3em\"><b>🚀快速开始</b></center>\n<br /><br />\n\n<center style=\"font-size: 1.5em\"><b>点击右上角 系统公告🔔 可再次查看 ｜ 完整内容可参考<a href=\"https://docs.anyrouter.top\" style=\"color: blue;\" target=\"_blank\">使用文档</a></b></center>\n\n<br /><br />\n<span style=\"font-size: 1.5em\">❗️提示</span>\n<br /><br />\n[2025/09/30] Claude Sonnet 4.5 模型现已发布，使用 npm i -g @anthropic-ai/claude-code 更新最新版本 Claude Code 并使用 /model 选择 sonnet 4.5 体验最新模型\n<br /><br />\n[2025/07/27] 本站目前试验性开放邮箱登录，为防止滥用，当前仅允许 *.edu.cn 后缀邮箱注册，发送邮件可能有一定的延迟，也可能被识别为垃圾邮件，请注意检查\n<br /><br />\n[2025/07/16] 由于持续遭受攻击，本站停止服务一天，请关注后续通知。另外本站从未官方或授权其他人建立群聊、发布教程等，除官网所示备用 API 域名外也没有建立其他 AnyRouter 或近似名称的镜像站，请注意避免受到欺骗\n<br /><br />\n[2025/07/15] 此前的封禁中有一条错误的规则导致很多用户正常通过 GitHub 登录会遭遇封禁，现在已经找到了问题并进行了修复，烦请各位用户通过自助解封功能恢复账号，造成不便敬请谅解\n<br /><br />\n[2025/07/15] 根据启发式规则封禁了部分用户。后续将提供自助解除封禁的功能，目前管理员无法对所有此类邮件进行回复，请耐心等待\n<br /><br />\n[2025/07/15] 本站日前遭遇了大量攻击和滥用。为保障服务质量，本站暂时停止来自 Github 账号的新用户注册；来自 Linux Do 账号的注册以及所有已注册用户的登录均不受影响。\n\n\n<br /><br />\n<span style=\"font-size: 1.5em\"> 1️⃣ 安装 Node.js（已安装可跳过）</span>\n<br /><br />\n确保 Node.js 版本 ≥ 18.0\n\n```bash\n# Ubuntu / Debian 用户\ncurl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -\nsudo apt-get install -y nodejs\nnode --version\n\n# macOS 用户\nsudo xcode-select --install\n/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"\nbrew install node\nnode --version\n```\n\n<br /><br />\n<span style=\"font-size: 1.5em\">2️⃣ 安装 Claude Code</span>\n<br /><br />\n```bash\nnpm install -g @anthropic-ai/claude-code\nclaude --version\n```\n<br /><br />\n<span style=\"font-size: 1.5em\">3️⃣ 开始使用</span>\n<br /><br />\n- **获取 Auth Token：** `ANTHROPIC_AUTH_TOKEN` ：注册后在 `API令牌` 页面点击 `添加令牌` 获得（以 `sk-` 开头）\n  - 名称随意，额度建议设为无限额度，其他保持默认设置即可\n\n<br />\n\n- **API地址：** `ANTHROPIC_BASE_URL`：`https://anyrouter.top` 是本站的 API 服务地址，**与主站地址相同**\n\n<br />\n在您的项目目录下运行：\n<br />\n\n```bash\ncd your-project-folder\nexport ANTHROPIC_AUTH_TOKEN=sk-... \nexport ANTHROPIC_BASE_URL=https://anyrouter.top\nclaude\n```\n\n<br />\n运行后\n\n- 选择你喜欢的主题 + Enter\n- 确认安全须知 + Enter\n- 使用默认 Terminal 配置 + Enter\n- 信任工作目录 + Enter\n\n<br />\n开始在终端里和你的 AI 编程搭档一起写代码吧！🚀\n\n<br /><br />\n\n<span style=\"font-size: 1.5em\">4️⃣ 配置环境变量（推荐）</span>\n<br /><br />\n为避免每次重复输入，可将环境变量写入 bash_profile 和 bashrc：\n<br />\n```bash\necho -e '\\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.bash_profile\necho -e '\\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.bash_profile\necho -e '\\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.bashrc\necho -e '\\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.bashrc\necho -e '\\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.zshrc\necho -e '\\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.zshrc\n```\n<br />\n重启终端后，直接使用：\n<br />\n\n```bash\ncd your-project-folder\nclaude\n```\n\n<br />\n即可使用 Claude Code\n\n<br /><br />\n\n<span style=\"font-size: 1.5em\"> 💡 OpenAI Codex 使用方式 </span>\n<br /><br />\n<span style=\"font-size: 1.5em\"> 1️⃣ 安装 Node.js</span>\n<br /><br />\n与 Claude Code 步骤 1️⃣ 相同\n<br /><br />\n<span style=\"font-size: 1.5em\"> 2️⃣ 安装 codex </span>\n<br /><br />\n```bash\nnpm i -g @openai/codex\ncodex --version\n```\n<br /><br />\n<span style=\"font-size: 1.5em\"> 3️⃣ 开始使用 </span>\n<br /><br />\n- **获取 Auth Token：** 注册后在 `API令牌` 页面点击 `添加令牌` 获得（以 `sk-` 开头）\n  - 名称随意，额度建议设为无限额度，其他保持默认设置即可\n<br /><br />\n- 创建 `~/.codex/config.toml` 文件，并添加如下配置：\n```toml\nmodel = \"gpt-5-codex\"\nmodel_provider = \"anyrouter\"\npreferred_auth_method = \"apikey\"\n\n\n[model_providers.anyrouter]\nname = \"Any Router\"\nbase_url = \"https://anyrouter.top/v1\"\nwire_api = \"responses\"\n```\n- 创建 `~/.codex/auth.json` 文件，并添加如下配置：\n```json\n{\n  \"OPENAI_API_KEY\":\"这里换成你申请的 KEY\"\n}\n```\n<br /><br />\n⚠️ 上述配置文件的路径 `~/.codex` 也可以用 `CODEX_HOME` 环境变量指定\n<br /><br />\n在您的项目目录下运行：\n<br />\n\n```bash\ncd your-project-folder\ncodex\n```\n\n\n<br /><br />\n\n<span style=\"font-size: 1.5em\"> ❓FAQ </span>\n<br /><br />\n\n- 本站直接接入官方 Claude Code 转发，无法转发非 Claude Code 的 API 流量\n<br /><br />\n- 如遇 API 报错，可能是转发代理不稳定导致，可以考虑退出 Claude Code 重试几次\n<br /><br />\n- 如果网页遇到登录错误可以尝试清除本站的 Cookie，重新登录\n<br /><br />\n- `Invalid API Key  · Please run /login` 怎么解决？这表明 Claude Code 没有检测到 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_BASE_URL` 环境变量，检查环境变量是否配好。\n<br /><br />\n- 显示 `offline` 是什么原因？Claude Code 会通过检查是否能连接到 Google 来对网络进行判断。显示 `offline` 并不影响正常使用 Claude Code，只是表明 Claude Code 未能连接 Google。\n<br /><br />\n- 为什么浏览网页的 Fetch 会失败？这是因为 Claude Code 在访问网页前会调用 Claude 的服务来判断网页是否可以访问。需要保持国际互联网连接并进行全局代理，才可以访问 Claude 判断网页是否可以访问的服务。\n<br /><br />\n- 为什么请求总是显示 fetch failed？可能是因为所在地区的网络环境导致的，可以尝试使用代理工具或者使用备用 API 端点 `ANTHROPIC_BASE_URL=https://pmpjfbhq.cn-nb1.rainapp.top`",
  "message": "",
  "success": true
}
```

### 4. https://anyrouter.top/api/oauth/state

- 状态码: 200
- 时间: 2025-11-05T17:31:30.696Z
- 数据:
```json
{
  "data": "yBb6mk6DXxjJ",
  "message": "",
  "success": true
}
```



## 📊 分析总结

### 可能包含余额信息的API：

- **https://anyrouter.top/api/status**
  - 状态: 200
  - ✅ 包含 "quota" 字段
  - ✅ 包含 "$" 符号



