const express = require('express');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

const app = express();
const PORT = 3001;

// 中间件设置
app.use(express.json());
app.use(express.static('public'));

// 数据库初始化
const db = new sqlite3.Database('anyrouter.db');

// 创建表
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS check_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE,
        status TEXT,
        balance TEXT,
        reward TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS session_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        is_logged_in BOOLEAN DEFAULT 0,
        last_check DATETIME,
        user_data_dir TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

class SimpleAnyRouterBot {
    constructor() {
        this.browser = null;
        this.page = null;
        this.userDataDir = './chrome-user-data';
    }

    async init() {
        // 尝试找到系统Chrome浏览器路径
        const chromePaths = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
            '/usr/bin/google-chrome', // Linux
            '/usr/bin/chromium-browser', // Linux Chromium
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' // Windows 32-bit
        ];

        let executablePath = null;
        for (const path of chromePaths) {
            try {
                const fs = require('fs');
                if (fs.existsSync(path)) {
                    executablePath = path;
                    break;
                }
            } catch (e) {
                // 继续尝试下一个路径
            }
        }

        const launchOptions = {
            headless: false, // 保持可见以便用户手动登录
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                `--user-data-dir=${this.userDataDir}` // 保存用户会话
            ]
        };

        // 如果找到系统Chrome，使用它
        if (executablePath) {
            launchOptions.executablePath = executablePath;
            console.log(`使用系统Chrome: ${executablePath}`);
        } else {
            console.log('使用Puppeteer内置Chrome');
        }

        this.browser = await puppeteer.launch(launchOptions);
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 720 });
    }

    async openForLogin() {
        try {
            console.log('打开AnyRouter供用户登录...');
            await this.page.goto('https://anyrouter.top', { waitUntil: 'networkidle2' });

            // 检查是否已经登录
            const currentUrl = this.page.url();
            if (currentUrl.includes('dashboard') || currentUrl.includes('home') || !currentUrl.includes('login')) {
                return { success: true, message: '检测到已登录状态', isLoggedIn: true };
            }

            return { success: true, message: '请在打开的浏览器中手动登录AnyRouter', isLoggedIn: false };
        } catch (error) {
            return { success: false, message: `打开页面错误: ${error.message}` };
        }
    }

    async checkLoginStatus() {
        try {
            await this.page.goto('https://anyrouter.top', { waitUntil: 'networkidle2' });

            const currentUrl = this.page.url();
            const isLoggedIn = currentUrl.includes('dashboard') || currentUrl.includes('home') || !currentUrl.includes('login');

            return { success: true, isLoggedIn, currentUrl };
        } catch (error) {
            return { success: false, message: `检查登录状态错误: ${error.message}` };
        }
    }

    async checkDailyReward() {
        try {
            console.log('开始检查每日奖励...');

            // 刷新页面
            await this.page.reload({ waitUntil: 'networkidle2' });

            // 等待页面加载完成
            await this.page.waitForTimeout(3000);

            // 查找余额元素
            let balance = '未找到';
            try {
                await this.page.waitForSelector('.text-lg.font-semibold', { timeout: 10000 });
                const balanceElement = await this.page.$('.text-lg.font-semibold');
                if (balanceElement) {
                    balance = await this.page.evaluate(el => el.textContent, balanceElement);
                }
            } catch (e) {
                console.log('未找到余额元素，尝试其他选择器...');

                // 尝试其他可能的余额选择器
                const alternativeSelectors = [
                    '[class*="balance"]',
                    '[class*="money"]',
                    '[class*="dollar"]',
                    '.balance',
                    '#balance',
                    '[data-testid*="balance"]'
                ];

                for (const selector of alternativeSelectors) {
                    try {
                        const element = await this.page.$(selector);
                        if (element) {
                            balance = await this.page.evaluate(el => el.textContent, element);
                            break;
                        }
                    } catch (e) {
                        // 继续尝试下一个选择器
                    }
                }
            }

            // 检查是否有奖励相关信息
            let rewardMessage = '';
            let hasReward = false;

            try {
                // 搜索包含奖励关键词的文本
                const rewardKeywords = ['reward', 'bonus', 'daily', '$25', '25', 'earned', 'received'];

                for (const keyword of rewardKeywords) {
                    const elements = await this.page.$x(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${keyword}')]`);
                    if (elements.length > 0) {
                        const text = await this.page.evaluate(el => el.textContent, elements[0]);
                        rewardMessage += text + ' ';
                        if (text.includes('25') || text.includes('$25')) {
                            hasReward = true;
                        }
                    }
                }
            } catch (e) {
                console.log('搜索奖励信息时出错:', e.message);
            }

            const result = {
                success: true,
                balance: balance.trim(),
                reward: hasReward ? '$25' : '无',
                message: rewardMessage.trim() || '页面刷新完成，已检查奖励状态'
            };

            console.log('检查结果:', result);
            return result;

        } catch (error) {
            console.error('检查每日奖励错误:', error);
            return {
                success: false,
                balance: '检查失败',
                reward: '无',
                message: `检查错误: ${error.message}`
            };
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// 全局bot实例
let globalBot = null;

// API路由

// 初始化浏览器并打开登录页面
app.post('/api/init-login', async (req, res) => {
    try {
        if (globalBot) {
            await globalBot.close();
        }

        globalBot = new SimpleAnyRouterBot();
        await globalBot.init();

        const result = await globalBot.openForLogin();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 检查登录状态
app.get('/api/login-status', async (req, res) => {
    try {
        if (!globalBot) {
            res.json({ success: false, message: '请先初始化浏览器' });
            return;
        }

        const result = await globalBot.checkLoginStatus();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 手动执行检查
app.post('/api/check', async (req, res) => {
    try {
        if (!globalBot) {
            // 自动初始化浏览器
            globalBot = new SimpleAnyRouterBot();
            await globalBot.init();
        }

        // 先检查登录状态
        const loginStatus = await globalBot.checkLoginStatus();
        if (!loginStatus.isLoggedIn) {
            res.status(400).json({ error: '用户未登录，请先登录AnyRouter' });
            return;
        }

        // 执行检查
        const checkResult = await globalBot.checkDailyReward();

        // 记录结果
        const today = moment().format('YYYY-MM-DD');
        const status = checkResult.success ? 'success' : 'failed';

        db.run(`INSERT OR REPLACE INTO check_records
                (date, status, balance, reward, message)
                VALUES (?, ?, ?, ?, ?)`,
            [today, status, checkResult.balance, checkResult.reward, checkResult.message],
            function(err) {
                if (err) {
                    console.error('保存记录失败:', err);
                }
            });

        res.json(checkResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取检查记录
app.get('/api/records', (req, res) => {
    db.all(`SELECT * FROM check_records ORDER BY date DESC LIMIT 30`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 关闭浏览器
app.post('/api/close', async (req, res) => {
    try {
        if (globalBot) {
            await globalBot.close();
            globalBot = null;
        }
        res.json({ message: '浏览器已关闭' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 定时任务 - 每天早上6点执行
cron.schedule('0 6 * * *', async () => {
    console.log('开始执行每日检查任务...');

    try {
        if (!globalBot) {
            globalBot = new SimpleAnyRouterBot();
            await globalBot.init();
        }

        // 检查登录状态
        const loginStatus = await globalBot.checkLoginStatus();
        if (!loginStatus.isLoggedIn) {
            console.error('定时任务执行失败：用户未登录');
            return;
        }

        // 执行检查
        const checkResult = await globalBot.checkDailyReward();
        console.log('定时检查结果:', checkResult);

        // 记录结果
        const today = moment().format('YYYY-MM-DD');
        const status = checkResult.success ? 'success' : 'failed';

        db.run(`INSERT OR REPLACE INTO check_records
                (date, status, balance, reward, message)
                VALUES (?, ?, ?, ?, ?)`,
            [today, status, checkResult.balance, checkResult.reward, checkResult.message],
            function(err) {
                if (err) {
                    console.error('保存记录失败:', err);
                } else {
                    console.log('定时任务完成，记录已保存');
                }
            });

    } catch (error) {
        console.error('定时任务执行错误:', error);
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🌐 AnyRouter 每日打卡系统启动成功！`);
    console.log(`📱 管理界面: http://localhost:${PORT}`);
    console.log(`⏰ 定时任务: 每天早上6点自动执行`);
    console.log(`📝 使用说明:`);
    console.log(`   1. 访问管理界面`);
    console.log(`   2. 点击"打开浏览器"按钮`);
    console.log(`   3. 在弹出的浏览器中手动登录AnyRouter`);
    console.log(`   4. 登录后可以关闭浏览器窗口，系统会保持登录状态`);
    console.log(`   5. 每天6点自动检查，也可手动检查`);
});

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...');
    if (globalBot) {
        await globalBot.close();
    }
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('数据库连接已关闭');
        process.exit(0);
    });
});