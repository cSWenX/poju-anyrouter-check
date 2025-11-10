const express = require('express');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 3010;

// 中间件设置
app.use(express.json());
app.use(express.static('public'));

// 数据库初始化 - 使用持久化存储路径
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'anyrouter.db')
    : process.env.RENDER_EXTERNAL_DISK
    ? path.join(process.env.RENDER_EXTERNAL_DISK, 'anyrouter.db')
    : process.env.ZEABUR_VOLUME_DIR
    ? path.join(process.env.ZEABUR_VOLUME_DIR, 'anyrouter.db')
    : 'anyrouter.db';
console.log('数据库路径:', dbPath);
const db = new sqlite3.Database(dbPath);

// 创建表
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login_type TEXT DEFAULT 'password',
        username TEXT,
        password TEXT,
        use_github BOOLEAN DEFAULT 0,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS check_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        status TEXT,
        balance TEXT,
        reward TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS cookies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cookies TEXT,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 为旧数据库迁移:移除 date 字段的 UNIQUE 约束
    // 检查是否需要迁移
    db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='check_records'`, (err, row) => {
        if (!err && row && row.sql.includes('date TEXT UNIQUE')) {
            console.log('检测到旧数据库结构,正在迁移...');
            db.run(`ALTER TABLE check_records RENAME TO check_records_old`, (err) => {
                if (err) {
                    console.error('数据库迁移失败:', err);
                    return;
                }

                db.run(`CREATE TABLE check_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT,
                    status TEXT,
                    balance TEXT,
                    reward TEXT,
                    message TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, (err) => {
                    if (err) {
                        console.error('创建新表失败:', err);
                        return;
                    }

                    db.run(`INSERT INTO check_records (id, date, status, balance, reward, message, created_at)
                            SELECT id, date, status, balance, reward, message, created_at FROM check_records_old`, (err) => {
                        if (err) {
                            console.error('数据迁移失败:', err);
                            return;
                        }

                        db.run(`DROP TABLE check_records_old`, (err) => {
                            if (err) {
                                console.error('删除旧表失败:', err);
                            } else {
                                console.log('数据库迁移成功完成');
                            }
                        });
                    });
                });
            });
        }
    });

    // 检查cookies表是否需要添加user_id列
    db.get(`PRAGMA table_info(cookies)`, (err, row) => {
        if (!err) {
            // 检查是否已经有user_id列
            db.all(`PRAGMA table_info(cookies)`, (err, columns) => {
                if (!err && columns) {
                    const hasUserId = columns.some(col => col.name === 'user_id');
                    if (!hasUserId) {
                        console.log('检测到cookies表缺少user_id列,正在添加...');
                        db.run(`ALTER TABLE cookies ADD COLUMN user_id TEXT`, (err) => {
                            if (err) {
                                console.error('添加user_id列失败:', err);
                            } else {
                                console.log('成功添加user_id列到cookies表');
                            }
                        });
                    }
                }
            });
        }
    });

    // 检查user_settings表是否需要添加user_id列
    db.get(`PRAGMA table_info(user_settings)`, (err, row) => {
        if (!err) {
            db.all(`PRAGMA table_info(user_settings)`, (err, columns) => {
                if (!err && columns) {
                    const hasUserId = columns.some(col => col.name === 'user_id');
                    if (!hasUserId) {
                        console.log('检测到user_settings表缺少user_id列,正在添加...');
                        db.run(`ALTER TABLE user_settings ADD COLUMN user_id TEXT`, (err) => {
                            if (err) {
                                console.error('添加user_id列到user_settings表失败:', err);
                            } else {
                                console.log('成功添加user_id列到user_settings表');
                            }
                        });
                    }
                }
            });
        }
    });
});

// 全局变量存储登录信息
let userCredentials = null;
let globalBot = null; // 全局浏览器实例

// 辅助函数：从页面获取用户ID
async function extractUserId(page) {
    try {
        const userId = await page.evaluate(() => {
            // 1. 尝试从localStorage获取
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.id || user.user_id) {
                        return user.id || user.user_id;
                    }
                } catch (e) {}
            }

            // 2. 尝试从sessionStorage获取
            const sessionUserStr = sessionStorage.getItem('user');
            if (sessionUserStr) {
                try {
                    const user = JSON.parse(sessionUserStr);
                    if (user.id || user.user_id) {
                        return user.id || user.user_id;
                    }
                } catch (e) {}
            }

            // 3. 尝试从全局变量获取
            if (typeof window.user !== 'undefined' && window.user) {
                if (window.user.id || window.user.user_id) {
                    return window.user.id || window.user.user_id;
                }
            }

            return null;
        });

        if (userId) {
            console.log(`成功从浏览器提取用户ID: ${userId}`);
            return userId;
        }

        // 4. 如果localStorage/sessionStorage中没有，尝试调用API获取
        console.log('localStorage中未找到用户ID，尝试通过API获取...');
        const cookies = await page.cookies();
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        const userInfo = await page.evaluate(async (cookieStr) => {
            try {
                const response = await fetch('https://anyrouter.top/api/user/self', {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json, text/plain, */*',
                        'cache-control': 'no-store',
                        'cookie': cookieStr
                    }
                });
                const data = await response.json();
                return data;
            } catch (e) {
                return null;
            }
        }, cookieString);

        // 从API响应中提取用户ID
        if (userInfo && userInfo.data && userInfo.data.id) {
            console.log(`成功从API提取用户ID: ${userInfo.data.id}`);
            return userInfo.data.id;
        }

        console.log('无法提取用户ID');
        return null;
    } catch (error) {
        console.error('提取用户ID时出错:', error);
        return null;
    }
}

// 辅助函数：保存 Cookie 到数据库
function saveCookies(cookies, userId = null) {
    return new Promise((resolve, reject) => {
        const cookiesJson = JSON.stringify(cookies);
        db.run('DELETE FROM cookies', (err) => {
            if (err) {
                reject(err);
                return;
            }
            db.run('INSERT INTO cookies (cookies, user_id, updated_at) VALUES (?, ?, datetime("now"))',
                [cookiesJson, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    console.log('Cookies 已保存到数据库', userId ? `(用户ID: ${userId})` : '');
                    resolve();
                }
            });
        });
    });
}

// 辅助函数：从数据库加载 Cookie
function loadCookies() {
    return new Promise((resolve, reject) => {
        db.get('SELECT cookies, user_id FROM cookies ORDER BY id DESC LIMIT 1', (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                try {
                    const cookies = JSON.parse(row.cookies);
                    console.log('从数据库加载了 Cookies', row.user_id ? `(用户ID: ${row.user_id})` : '');
                    resolve({ cookies, userId: row.user_id });
                } catch (e) {
                    reject(e);
                }
            } else {
                resolve(null);
            }
        });
    });
}

// 辅助函数：清除数据库中的 Cookie
function clearCookies() {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM cookies', (err) => {
            if (err) {
                reject(err);
            } else {
                console.log('Cookies 已从数据库清除');
                resolve();
            }
        });
    });
}

class AnyRouterBot {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        // 检测运行环境
        const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
        const isRender = process.env.RENDER !== undefined;
        const isZeabur = process.env.ZEABUR !== undefined;
        const isProduction = isRailway || isRender || isZeabur;
        const isDevelopment = !isProduction;

        const launchOptions = {
            headless: isProduction ? true : false, // 生产环境使用 headless
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--disable-extensions'
            ]
        };

        // 只在本地开发时指定 Chrome 路径
        if (isDevelopment && process.platform === 'darwin') {
            launchOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        }
        // Render 环境使用系统 Chromium
        else if (isRender && process.env.PUPPETEER_EXECUTABLE_PATH) {
            launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }
        // Zeabur 使用 Puppeteer 自带的 Chromium

        console.log('Puppeteer 启动配置:', JSON.stringify(launchOptions, null, 2));
        this.browser = await puppeteer.launch(launchOptions);
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 720 });
    }

    async loginWithGitHub() {
        try {
            console.log('开始GitHub OAuth登录流程...');
            await this.page.goto('https://anyrouter.top', { waitUntil: 'networkidle2' });

            // 寻找GitHub登录按钮
            const githubLoginSelectors = [
                'a[href*="github"]',
                'button[class*="github"]',
                '[class*="oauth"] a[href*="github"]',
                '.github-login',
                '[data-provider="github"]',
                'a:contains("GitHub")',
                'a:contains("github")'
            ];

            let githubButton = null;
            for (const selector of githubLoginSelectors) {
                try {
                    githubButton = await this.page.$(selector);
                    if (githubButton) {
                        console.log(`找到GitHub登录按钮: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个选择器
                }
            }

            // 如果没找到GitHub按钮，尝试通过文本查找
            if (!githubButton) {
                githubButton = await this.page.$x("//a[contains(text(), 'GitHub') or contains(text(), 'github')]");
                if (githubButton.length > 0) {
                    githubButton = githubButton[0];
                    console.log('通过文本找到GitHub登录按钮');
                }
            }

            if (!githubButton) {
                return { success: false, message: '未找到GitHub登录按钮，请检查AnyRouter是否支持GitHub登录' };
            }

            // 点击GitHub登录按钮
            console.log('点击GitHub登录按钮...');
            await githubButton.click();

            // 等待跳转到GitHub
            await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

            const currentUrl = this.page.url();
            console.log('当前页面URL:', currentUrl);

            // 检查是否已经跳转到GitHub
            if (currentUrl.includes('github.com')) {
                console.log('已跳转到GitHub OAuth页面');

                // 等待OAuth授权完成并返回
                try {
                    await this.page.waitForFunction(
                        () => !window.location.href.includes('github.com'),
                        { timeout: 60000 }
                    );
                } catch (e) {
                    return { success: false, message: 'GitHub OAuth授权超时，请手动完成授权' };
                }

                // 检查最终是否登录成功
                const finalUrl = this.page.url();
                console.log('最终页面URL:', finalUrl);

                if (finalUrl.includes('anyrouter.top') && (finalUrl.includes('dashboard') || finalUrl.includes('home') || !finalUrl.includes('login'))) {
                    return { success: true, message: 'GitHub OAuth登录成功' };
                } else {
                    return { success: false, message: 'GitHub OAuth登录可能失败，请检查授权状态' };
                }
            } else if (currentUrl.includes('anyrouter.top') && (currentUrl.includes('dashboard') || currentUrl.includes('home'))) {
                // 可能已经登录了
                return { success: true, message: '已经登录，GitHub OAuth验证成功' };
            } else {
                return { success: false, message: `未预期的页面跳转: ${currentUrl}` };
            }

        } catch (error) {
            console.error('GitHub登录错误:', error);
            return { success: false, message: `GitHub登录错误: ${error.message}` };
        }
    }

    async login(username, password) {
        try {
            await this.page.goto('https://anyrouter.top', { waitUntil: 'networkidle2' });

            // 等待登录表单加载
            await this.page.waitForSelector('input[type="email"], input[name="username"]', { timeout: 10000 });

            // 输入用户名和密码
            await this.page.type('input[type="email"], input[name="username"]', username);
            await this.page.type('input[type="password"]', password);

            // 点击登录按钮
            await this.page.click('button[type="submit"], input[type="submit"]');

            // 等待登录完成，检查是否跳转到主页
            await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

            // 检查是否登录成功
            const currentUrl = this.page.url();
            if (currentUrl.includes('dashboard') || currentUrl.includes('home')) {
                return { success: true, message: '登录成功' };
            } else {
                return { success: false, message: '登录失败，请检查用户名和密码' };
            }
        } catch (error) {
            return { success: false, message: `登录错误: ${error.message}` };
        }
    }

    async checkDailyReward() {
        try {
            console.log('开始执行签到流程...');

            // 获取当前页面的 Cookie
            const cookies = await this.page.cookies();
            const sessionCookie = cookies.find(c => c.name === 'session');

            if (!sessionCookie) {
                throw new Error('未找到 session Cookie');
            }

            // 准备 Cookie 字符串
            const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

            // 1. 调用签到接口
            console.log('1. 调用签到接口 /api/user/sign_in');
            const signInResult = await this.page.evaluate(async (cookieStr) => {
                const response = await fetch('https://anyrouter.top/api/user/sign_in', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json, text/plain, */*',
                        'cache-control': 'no-store',
                        'cookie': cookieStr
                    }
                });
                return await response.json();
            }, cookieString);

            console.log('签到结果:', signInResult);

            // 2. 先获取用户ID (从页面的localStorage或全局变量中)
            console.log('2. 获取用户ID');
            const userId = await this.page.evaluate(() => {
                // 尝试从localStorage获取
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        return user.id || user.user_id;
                    } catch (e) {}
                }

                // 尝试从sessionStorage获取
                const sessionUserStr = sessionStorage.getItem('user');
                if (sessionUserStr) {
                    try {
                        const user = JSON.parse(sessionUserStr);
                        return user.id || user.user_id;
                    } catch (e) {}
                }

                // 返回null如果找不到
                return null;
            });

            console.log('用户ID:', userId);

            // 3. 使用用户ID获取用户信息
            console.log('3. 获取用户信息 /api/user/self');
            const userInfo = await this.page.evaluate(async (cookieStr, uid) => {
                const headers = {
                    'accept': 'application/json, text/plain, */*',
                    'cache-control': 'no-store',
                    'cookie': cookieStr
                };

                // 如果有用户ID,添加到请求头
                if (uid) {
                    headers['new-api-user'] = String(uid);
                }

                const response = await fetch('https://anyrouter.top/api/user/self', {
                    method: 'GET',
                    headers: headers
                });
                const data = await response.json();
                console.log('[Browser] /api/user/self 响应:', JSON.stringify(data));
                return data;
            }, cookieString, userId);

            console.log('[Server] 用户信息:', JSON.stringify(userInfo));

            // 提取余额信息（从用户信息中）
            // 根据 API 响应结构: userInfo.data.quota 是用户的 quota
            // quota_per_unit = 500000 表示 500000 quota = $1
            const quota = userInfo?.data?.quota || 0;
            const balance = `$${(quota / 500000).toFixed(2)}`;
            console.log(`[Server] 计算余额: quota=${quota}, balance=${balance}`);

            // 判断签到是否成功
            const signInSuccess = signInResult?.success === true;
            const rewardMessage = signInSuccess ? '签到成功' : (signInResult?.message || '签到状态未知');

            return {
                success: true,
                balance: balance,
                reward: signInSuccess ? '已签到' : '无',
                message: rewardMessage,
                userId: userId,  // 返回用户ID以便保存到数据库
                // 调试信息：返回完整的API响应
                debug: {
                    signInResult: signInResult,  // sign_in 接口的完整响应
                    userInfo: userInfo,           // user/self 接口的完整响应
                    quota: quota,                 // 提取的 quota 值
                    calculatedBalance: balance    // 计算出的余额
                }
            };
        } catch (error) {
            console.error('签到过程出错:', error);
            return {
                success: false,
                balance: '未知',
                reward: '无',
                message: `签到错误: ${error.message}`
            };
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// API路由

// 获取用户设置
app.get('/api/settings', (req, res) => {
    db.get('SELECT login_type, username, use_github, user_id FROM user_settings ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row || {});
    });
});

// 保存用户设置
app.post('/api/settings', (req, res) => {
    const { username, password, use_github, user_id } = req.body;

    if (use_github) {
        // GitHub登录模式，不需要用户名密码，但需要user_id
        if (!user_id) {
            res.status(400).json({ error: '使用GitHub登录时，请提供用户ID' });
            return;
        }

        db.run('DELETE FROM user_settings', (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            db.run('INSERT INTO user_settings (login_type, use_github, user_id) VALUES (?, ?, ?)',
                ['github', true, user_id], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                userCredentials = { use_github: true, user_id };

                // 同时更新 cookies 表中的 user_id
                db.run('UPDATE cookies SET user_id = ? WHERE id = (SELECT MAX(id) FROM cookies)', [user_id], (updateErr) => {
                    if (updateErr) {
                        console.error('更新 cookies 表中的 user_id 失败:', updateErr);
                    } else {
                        console.log(`已更新 cookies 表中的 user_id 为: ${user_id}`);
                    }
                });

                res.json({ message: 'GitHub登录设置保存成功，用户ID已保存' });
            });
        });
    } else {
        // 传统用户名密码登录
        if (!username || !password) {
            res.status(400).json({ error: '用户名和密码不能为空' });
            return;
        }

        db.run('DELETE FROM user_settings', (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            db.run('INSERT INTO user_settings (login_type, username, password, use_github, user_id) VALUES (?, ?, ?, ?, ?)',
                ['password', username, password, false, user_id || null], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                userCredentials = { username, password, use_github: false, user_id: user_id || null };

                // 同时更新 cookies 表中的 user_id
                if (user_id) {
                    db.run('UPDATE cookies SET user_id = ? WHERE id = (SELECT MAX(id) FROM cookies)', [user_id], (updateErr) => {
                        if (updateErr) {
                            console.error('更新 cookies 表中的 user_id 失败:', updateErr);
                        } else {
                            console.log(`已更新 cookies 表中的 user_id 为: ${user_id}`);
                        }
                    });
                }

                res.json({ message: '设置保存成功' });
            });
        });
    }
});

// 手动执行检查
app.post('/api/check', async (req, res) => {
    try {
        // 优先检查是否有打开的浏览器（更可靠）
        if (globalBot && globalBot.browser && globalBot.page) {
            try {
                // 检查是否已登录
                const isLoggedIn = await checkIfLoggedIn(globalBot.page);
                if (!isLoggedIn) {
                    res.status(400).json({ error: '检测到未登录状态，请先在浏览器中登录' });
                    return;
                }

                // 检查每日奖励
                const checkResult = await globalBot.checkDailyReward();

                console.log('签到检查结果:', checkResult);

                // 保存最新的 Cookie 和用户ID
                const cookies = await globalBot.page.cookies();
                await saveCookies(cookies, checkResult.userId);

                // 记录结果
                const today = moment().format('YYYY-MM-DD HH:mm:ss');
                const status = checkResult.success ? 'success' : 'failed';

                await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO check_records
                            (date, status, balance, reward, message)
                            VALUES (?, ?, ?, ?, ?)`,
                        [today, status, checkResult.balance, checkResult.reward, checkResult.message],
                        function(err) {
                            if (err) {
                                console.error('保存记录失败:', err);
                                reject(err);
                            } else {
                                console.log('打卡记录已保存到数据库');
                                resolve();
                            }
                        });
                });

                res.json(checkResult);
                return;
            } catch (error) {
                console.error('使用打开的浏览器检查失败:', error);
                // 继续尝试使用Cookie
            }
        }

        // 如果没有打开的浏览器，尝试使用保存的 Cookie
        const savedData = await loadCookies();

        // 如果 savedData 中没有 userId，尝试从 user_settings 表中获取
        let userId = savedData?.userId || null;
        if (!userId) {
            await new Promise((resolve) => {
                db.get('SELECT user_id FROM user_settings ORDER BY id DESC LIMIT 1', (err, row) => {
                    if (!err && row && row.user_id) {
                        userId = row.user_id;
                        console.log(`从user_settings表加载用户ID: ${userId}`);
                    }
                    resolve();
                });
            });
        }

        if (savedData && savedData.cookies && savedData.cookies.length > 0) {
            console.log('使用保存的 Cookie 直接调用签到 API', userId ? `(用户ID: ${userId})` : '');

            try {
                // 创建临时 headless 浏览器实例用于调用 API
                const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
                const isRender = process.env.RENDER !== undefined;
                const isZeabur = process.env.ZEABUR !== undefined;
                const launchOptions = {
                    headless: true,  // 使用 headless 模式
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu'
                    ]
                };

                // 只在本地 macOS 开发时指定 Chrome 路径
                if (!isRailway && !isRender && !isZeabur && process.platform === 'darwin') {
                    launchOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
                }
                // Render 环境使用系统 Chromium
                else if (isRender && process.env.PUPPETEER_EXECUTABLE_PATH) {
                    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
                }

                const tempBrowser = await puppeteer.launch(launchOptions);

                const tempPage = await tempBrowser.newPage();
                await tempPage.setViewport({ width: 1280, height: 720 });

                // 设置 Cookie
                await tempPage.setCookie(...savedData.cookies);

                // 访问页面
                await tempPage.goto('https://anyrouter.top', {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                // 获取当前页面的 Cookie
                const cookies = await tempPage.cookies();
                const sessionCookie = cookies.find(c => c.name === 'session');

                if (!sessionCookie) {
                    throw new Error('未找到 session Cookie，可能已过期');
                }

                // 准备 Cookie 字符串
                const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

                // 调用签到接口
                console.log('调用签到接口 /api/user/sign_in');
                const signInResult = await tempPage.evaluate(async (cookieStr) => {
                    const response = await fetch('https://anyrouter.top/api/user/sign_in', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json, text/plain, */*',
                            'cache-control': 'no-store',
                            'cookie': cookieStr
                        }
                    });
                    return await response.json();
                }, cookieString);

                console.log('签到结果:', signInResult);

                // 获取用户信息 - 直接使用 API
                console.log('调用 /api/user/self 获取用户信息');
                const userInfo = await tempPage.evaluate(async (cookieStr, userId) => {
                    const headers = {
                        'accept': 'application/json, text/plain, */*',
                        'cache-control': 'no-store',
                        'cookie': cookieStr
                    };

                    // 如果有用户ID,添加到请求头
                    if (userId) {
                        headers['new-api-user'] = String(userId);
                    }

                    const response = await fetch('https://anyrouter.top/api/user/self', {
                        method: 'GET',
                        headers: headers
                    });
                    const data = await response.json();
                    console.log('[Browser] /api/user/self 响应:', JSON.stringify(data));
                    return data;
                }, cookieString, userId);

                console.log('[Server] 用户信息:', JSON.stringify(userInfo));

                // 提取余额信息 - 统一使用 API 计算
                // 根据 API 响应结构: userInfo.data.quota 是用户的 quota
                // quota_per_unit = 500000 表示 500000 quota = $1
                const quota = userInfo?.data?.quota || 0;
                const balance = `$${(quota / 500000).toFixed(2)}`;
                console.log(`[Server] 从API计算余额: quota=${quota}, balance=${balance}`);

                // 判断签到是否成功
                const signInSuccess = signInResult?.success === true;
                const rewardMessage = signInSuccess ? '签到成功' : (signInResult?.message || '签到状态未知');

                const checkResult = {
                    success: true,
                    balance: balance,
                    reward: signInSuccess ? '已签到' : '无',
                    message: rewardMessage,
                    // 调试信息：返回完整的API响应
                    debug: {
                        signInResult: signInResult,  // sign_in 接口的完整响应
                        userInfo: userInfo,           // user/self 接口的完整响应
                        quota: quota,                 // 提取的 quota 值
                        calculatedBalance: balance,   // 计算出的余额
                        savedUserId: userId // 保存的用户ID或从settings表加载的用户ID
                    }
                };

                console.log('签到检查结果:', checkResult);

                // 保存更新后的 Cookie
                const updatedCookies = await tempPage.cookies();
                await saveCookies(updatedCookies);

                // 关闭临时浏览器
                await tempBrowser.close();

                // 记录结果
                const today = moment().format('YYYY-MM-DD HH:mm:ss');
                const status = checkResult.success ? 'success' : 'failed';

                await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO check_records
                            (date, status, balance, reward, message)
                            VALUES (?, ?, ?, ?, ?)`,
                        [today, status, checkResult.balance, checkResult.reward, checkResult.message],
                        function(err) {
                            if (err) {
                                console.error('保存记录失败:', err);
                                reject(err);
                            } else {
                                console.log('打卡记录已保存到数据库');
                                resolve();
                            }
                        });
                });

                res.json(checkResult);
                return;

            } catch (error) {
                console.error('使用 Cookie 调用 API 失败:', error);

                // 如果是 Cookie 过期，清除并返回错误
                if (error.message && error.message.includes('session Cookie')) {
                    await clearCookies();
                    res.status(400).json({ error: 'Cookie 已过期，请重新登录' });
                    return;
                }

                // 其他错误，返回失败
                res.status(500).json({ error: 'Cookie调用失败，请尝试打开浏览器登录' });
                return;
            }
        }

        // 如果没有 Cookie，提示用户先登录
        res.status(400).json({ error: '请先点击"打开浏览器登录"并完成登录' });

    } catch (error) {
        console.error('手动检查失败:', error);
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

// 初始化登录 - 打开浏览器供用户手动登录
app.post('/api/init-login', async (req, res) => {
    try {
        if (globalBot && globalBot.browser) {
            // 检查浏览器是否还在运行
            try {
                // 检查浏览器进程是否还存活
                const isConnected = globalBot.browser.isConnected();
                if (!isConnected) {
                    console.log('浏览器已断开连接，重新创建');
                    globalBot = null;
                    // 继续下面的代码重新创建浏览器
                } else {
                    // 检查页面是否还有效
                    if (!globalBot.page || globalBot.page.isClosed()) {
                        console.log('页面已关闭，重新创建浏览器');
                        try {
                            await globalBot.browser.close();
                        } catch (e) {}
                        globalBot = null;
                    } else {
                        // 检查页面是否可以访问
                        try {
                            await globalBot.page.url();
                        } catch (error) {
                            console.log('页面不可访问，重新创建浏览器');
                            try {
                                await globalBot.browser.close();
                            } catch (e) {}
                            globalBot = null;
                        }
                    }

                    if (globalBot) {
                        // 页面有效，检查登录状态
                        let isLoggedIn = false;
                        try {
                            isLoggedIn = await checkIfLoggedIn(globalBot.page);
                        } catch (error) {
                            console.log('检查登录状态出错:', error.message);
                            // 可能页面已经关闭，重新创建浏览器
                            try {
                                await globalBot.browser.close();
                            } catch (e) {}
                            globalBot = null;
                        }

                        if (globalBot) {
                            // 如果已登录，提取并保存用户ID
                            if (isLoggedIn) {
                                try {
                                    const userId = await extractUserId(globalBot.page);
                                    const cookies = await globalBot.page.cookies();
                                    await saveCookies(cookies, userId);
                                    if (userId) {
                                        console.log(`检测到已登录状态，已保存Cookie和用户ID: ${userId}`);
                                    }
                                } catch (error) {
                                    console.error('提取用户ID时出错:', error);
                                }
                            }

                            res.json({
                                success: true,
                                message: isLoggedIn ? '检测到已登录状态，Cookie已保存' : '浏览器已打开',
                                isLoggedIn: isLoggedIn
                            });
                            return;
                        }
                    }
                }
            } catch (e) {
                // 浏览器可能已关闭，重新创建
                console.log('浏览器检查失败，重新创建:', e.message);
                try {
                    if (globalBot && globalBot.browser) {
                        await globalBot.browser.close();
                    }
                } catch (closeError) {}
                globalBot = null;
            }
        }

        // 创建新的浏览器实例
        globalBot = new AnyRouterBot();
        await globalBot.init();

        // 尝试加载已保存的 Cookie
        const savedData = await loadCookies();
        if (savedData && savedData.cookies && savedData.cookies.length > 0) {
            console.log('尝试使用已保存的 Cookies 登录');
            await globalBot.page.setCookie(...savedData.cookies);
        }

        await globalBot.page.goto('https://anyrouter.top', { waitUntil: 'networkidle2' });

        // 等待页面完全加载
        await globalBot.page.waitForTimeout(1000);

        // 检查是否已登录
        let isLoggedIn = false;
        try {
            isLoggedIn = await checkIfLoggedIn(globalBot.page);
        } catch (error) {
            console.log('检查登录状态出错，假定未登录:', error.message);
            isLoggedIn = false;
        }

        // 如果已登录，提取并保存用户ID
        if (isLoggedIn) {
            try {
                const userId = await extractUserId(globalBot.page);
                if (userId) {
                    const cookies = await globalBot.page.cookies();
                    await saveCookies(cookies, userId);
                    console.log(`登录成功，已保存Cookie和用户ID: ${userId}`);
                } else {
                    console.log('警告：登录成功但无法提取用户ID');
                }
            } catch (error) {
                console.error('提取用户ID时出错:', error);
            }
        }

        // 如果有 Cookie 但检测到未登录，说明 Cookie 已过期，自动清除
        if (savedData && savedData.cookies && savedData.cookies.length > 0 && !isLoggedIn) {
            console.log('检测到 Cookie 已过期，自动清除过期 Cookie');
            await clearCookies();
            res.json({
                success: true,
                message: '检测到 Cookie 已过期并已自动清除，请在浏览器中重新登录',
                isLoggedIn: false,
                cookieExpired: true
            });
            return;
        }

        res.json({
            success: true,
            message: isLoggedIn ? '使用已保存的 Cookie 自动登录成功' : '浏览器已打开，请在浏览器中登录',
            isLoggedIn: isLoggedIn
        });
    } catch (error) {
        console.error('打开浏览器失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 检查登录状态
app.get('/api/login-status', async (req, res) => {
    try {
        // 方案1: 如果有打开的浏览器，直接检查浏览器登录状态
        if (globalBot && globalBot.browser && globalBot.page) {
            try {
                const isLoggedIn = await checkIfLoggedIn(globalBot.page);

                // 如果已登录，提取用户ID并保存最新的 Cookie
                if (isLoggedIn) {
                    const cookies = await globalBot.page.cookies();
                    try {
                        const userId = await extractUserId(globalBot.page);
                        await saveCookies(cookies, userId);
                        if (userId) {
                            console.log(`登录状态检查：已提取并保存用户ID: ${userId}`);
                        }
                    } catch (error) {
                        console.error('提取用户ID时出错:', error);
                        await saveCookies(cookies);
                    }
                }

                res.json({
                    success: true,
                    isLoggedIn: isLoggedIn,
                    message: isLoggedIn ? '已登录 AnyRouter (浏览器检测)' : '未登录，请先登录 AnyRouter'
                });
                return;
            } catch (error) {
                console.log('浏览器检查登录状态失败，尝试使用 Cookie 检查:', error.message);
            }
        }

        // 方案2: 没有打开的浏览器，通过调用 sign_in 接口验证 Cookie 是否有效
        const savedData = await loadCookies();

        if (!savedData || !savedData.cookies || savedData.cookies.length === 0) {
            res.json({
                success: true,
                isLoggedIn: false,
                message: '未找到 Cookie，请先登录'
            });
            return;
        }

        // 真正验证 Cookie 是否有效：调用 sign_in 接口
        try {
            console.log('通过 sign_in 接口验证 Cookie 有效性...');

            const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
            const isRender = process.env.RENDER !== undefined;
            const isZeabur = process.env.ZEABUR !== undefined;
            const launchOptions = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            };

            if (!isRailway && !isRender && !isZeabur && process.platform === 'darwin') {
                launchOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            } else if (isRender && process.env.PUPPETEER_EXECUTABLE_PATH) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            }

            const tempBrowser = await puppeteer.launch(launchOptions);
            const tempPage = await tempBrowser.newPage();
            await tempPage.setViewport({ width: 1280, height: 720 });

            // 设置 Cookie
            await tempPage.setCookie(...savedData.cookies);

            // 访问页面
            await tempPage.goto('https://anyrouter.top', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // 获取当前页面的 Cookie
            const cookies = await tempPage.cookies();
            const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

            // 调用 sign_in 接口验证
            const signInResult = await tempPage.evaluate(async (cookieStr) => {
                try {
                    const response = await fetch('https://anyrouter.top/api/user/sign_in', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json, text/plain, */*',
                            'cache-control': 'no-store',
                            'cookie': cookieStr
                        }
                    });
                    const data = await response.json();
                    return { success: response.ok, data: data };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }, cookieString);

            await tempBrowser.close();

            console.log('sign_in 接口验证结果:', signInResult);

            // 根据 sign_in 接口的响应判断是否已登录
            if (signInResult.success && signInResult.data) {
                // 如果返回成功或者返回特定的已签到消息，说明 Cookie 有效
                const isLoggedIn = signInResult.data.success !== false ||
                                   (signInResult.data.message && !signInResult.data.message.includes('未登录'));

                if (isLoggedIn) {
                    res.json({
                        success: true,
                        isLoggedIn: true,
                        message: '已登录 AnyRouter (Cookie有效)'
                    });
                } else {
                    // Cookie 无效，清除
                    await clearCookies();
                    res.json({
                        success: true,
                        isLoggedIn: false,
                        message: 'Cookie 已失效，请重新登录'
                    });
                }
            } else {
                // API 调用失败，Cookie 可能无效
                await clearCookies();
                res.json({
                    success: true,
                    isLoggedIn: false,
                    message: 'Cookie 验证失败，请重新登录'
                });
            }

        } catch (error) {
            console.error('验证 Cookie 时出错:', error);
            // 验证出错，保守处理：认为未登录
            res.json({
                success: true,
                isLoggedIn: false,
                message: '无法验证登录状态，请重新登录'
            });
        }

    } catch (error) {
        console.error('检查登录状态失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 关闭浏览器
app.post('/api/close', async (req, res) => {
    try {
        if (globalBot && globalBot.browser) {
            // 在关闭前保存 Cookie 和用户ID
            try {
                const cookies = await globalBot.page.cookies();
                const userId = await extractUserId(globalBot.page);
                await saveCookies(cookies, userId);
                console.log('关闭浏览器前已保存 Cookies', userId ? `和用户ID: ${userId}` : '');
            } catch (e) {
                console.error('保存 Cookies 失败:', e);
            }

            await globalBot.close();
            globalBot = null;
            res.json({ success: true, message: '浏览器已关闭，Cookie 已保存' });
        } else {
            res.json({ success: true, message: '浏览器未打开' });
        }
    } catch (error) {
        console.error('关闭浏览器失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 获取 Cookie
app.get('/api/cookies', async (req, res) => {
    try {
        const savedData = await loadCookies();
        if (savedData && savedData.cookies && savedData.cookies.length > 0) {
            res.json({
                success: true,
                cookies: savedData.cookies,
                cookiesString: savedData.cookies.map(c => `${c.name}=${c.value}`).join('; '),
                userId: savedData.userId || null
            });
        } else {
            res.json({
                success: true,
                cookies: [],
                cookiesString: '',
                userId: null
            });
        }
    } catch (error) {
        console.error('获取 Cookie 失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 清除 Cookie
app.post('/api/clear-cookies', async (req, res) => {
    try {
        await clearCookies();
        res.json({ success: true, message: 'Cookie 已清除' });
    } catch (error) {
        console.error('清除 Cookie 失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 导入 Cookie (用于云部署)
app.post('/api/import-cookies', async (req, res) => {
    try {
        const { cookies, userId } = req.body;

        if (!cookies || !Array.isArray(cookies)) {
            res.status(400).json({ error: 'cookies 必须是一个数组' });
            return;
        }

        // 保存 Cookie 到数据库
        await saveCookies(cookies, userId);

        res.json({
            success: true,
            message: `成功导入 ${cookies.length} 个 Cookie${userId ? `，用户ID: ${userId}` : ''}`
        });
    } catch (error) {
        console.error('导入 Cookie 失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 辅助函数：检查是否已登录
async function checkIfLoggedIn(page) {
    try {
        // 检查 page 是否仍然有效
        if (!page || page.isClosed()) {
            console.log('页面已关闭，无法检查登录状态');
            return false;
        }

        // 先刷新页面，确保获取最新状态
        await page.reload({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});

        const url = page.url();
        console.log('当前页面URL:', url);

        // 如果URL包含这些关键词，可能已登录
        if (url.includes('dashboard') || url.includes('home') || url.includes('account') || url.includes('console')) {
            console.log('通过URL判断：已登录');
            return true;
        }

        // 如果在登录页，检查是否有登录表单（未登录）还是会自动跳转（已登录）
        if (url.includes('/login')) {
            // 等待一小段时间，看是否会自动跳转
            await page.waitForTimeout(2000);
            const newUrl = page.url();
            if (!newUrl.includes('/login')) {
                console.log('自动跳转，已登录');
                return true;
            }
        }

        // 检查页面是否有登录表单
        const hasLoginForm = await page.$('input[type="email"], input[type="password"]').catch(() => null);
        if (hasLoginForm) {
            console.log('检测到登录表单：未登录');
            return false;
        }

        // 检查是否有用户相关的元素（比如余额显示）
        const hasBalance = await page.$('.text-lg.font-semibold').catch(() => null);
        if (hasBalance) {
            console.log('检测到余额元素：已登录');
            return true;
        }

        // 检查是否有用户头像或用户名显示
        const hasUserAvatar = await page.$('[class*="avatar"], [class*="user-menu"], [class*="profile"]').catch(() => null);
        if (hasUserAvatar) {
            console.log('检测到用户头像/菜单：已登录');
            return true;
        }

        // 获取页面HTML进行更详细的分析
        const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
        console.log('页面部分文本:', bodyText.substring(0, 200));

        // 检查文本中是否包含常见的已登录标识
        if (bodyText.includes('Sign out') || bodyText.includes('Logout') || bodyText.includes('登出') ||
            bodyText.includes('My Account') || bodyText.includes('我的账户')) {
            console.log('通过文本内容判断：已登录');
            return true;
        }

        console.log('无法确定登录状态，默认为未登录');
        return false;
    } catch (error) {
        console.error('检查登录状态时出错:', error.message);
        return false;
    }
}

// 自动检查函数 - 每分钟调用一次
async function executeAutoCheck() {
    try {
        // 优先检查是否有打开的浏览器（更可靠）
        if (globalBot && globalBot.browser && globalBot.page) {
            try {
                // 检查是否已登录
                const isLoggedIn = await checkIfLoggedIn(globalBot.page);
                if (!isLoggedIn) {
                    console.log('自动检查：检测到未登录状态，跳过本次检查');
                    return;
                }

                // 检查每日奖励
                const checkResult = await globalBot.checkDailyReward();
                console.log('自动检查结果:', checkResult);

                // 保存最新的 Cookie 和用户ID
                const cookies = await globalBot.page.cookies();
                await saveCookies(cookies, checkResult.userId);

                // 记录结果
                const today = moment().format('YYYY-MM-DD HH:mm:ss');
                const status = checkResult.success ? 'success' : 'failed';

                await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO check_records
                            (date, status, balance, reward, message)
                            VALUES (?, ?, ?, ?, ?)`,
                        [today, status, checkResult.balance, checkResult.reward, checkResult.message],
                        function(err) {
                            if (err) {
                                console.error('保存记录失败:', err);
                                reject(err);
                            } else {
                                console.log('自动检查记录已保存到数据库');
                                resolve();
                            }
                        });
                });

                return;
            } catch (error) {
                console.error('使用打开的浏览器自动检查失败:', error);
                // 继续尝试使用Cookie
            }
        }

        // 如果没有打开的浏览器，尝试使用保存的 Cookie
        const savedData = await loadCookies();

        // 如果 savedData 中没有 userId，尝试从 user_settings 表中获取
        let userId = savedData?.userId || null;
        if (!userId) {
            await new Promise((resolve) => {
                db.get('SELECT user_id FROM user_settings ORDER BY id DESC LIMIT 1', (err, row) => {
                    if (!err && row && row.user_id) {
                        userId = row.user_id;
                        console.log(`从user_settings表加载用户ID: ${userId}`);
                    }
                    resolve();
                });
            });
        }

        if (savedData && savedData.cookies && savedData.cookies.length > 0) {
            console.log('使用保存的 Cookie 执行自动检查', userId ? `(用户ID: ${userId})` : '');

            try {
                // 创建临时 headless 浏览器实例用于调用 API
                const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
                const isRender = process.env.RENDER !== undefined;
                const isZeabur = process.env.ZEABUR !== undefined;
                const launchOptions = {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu'
                    ]
                };

                // 只在本地 macOS 开发时指定 Chrome 路径
                if (!isRailway && !isRender && !isZeabur && process.platform === 'darwin') {
                    launchOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
                }
                // Render 环境使用系统 Chromium
                else if (isRender && process.env.PUPPETEER_EXECUTABLE_PATH) {
                    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
                }

                const tempBrowser = await puppeteer.launch(launchOptions);

                const tempPage = await tempBrowser.newPage();
                await tempPage.setViewport({ width: 1280, height: 720 });

                // 设置 Cookie
                await tempPage.setCookie(...savedData.cookies);

                // 访问页面
                await tempPage.goto('https://anyrouter.top', {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                // 获取当前页面的 Cookie
                const cookies = await tempPage.cookies();
                const sessionCookie = cookies.find(c => c.name === 'session');

                if (!sessionCookie) {
                    throw new Error('未找到 session Cookie，可能已过期');
                }

                // 准备 Cookie 字符串
                const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

                // 调用签到接口
                console.log('自动检查：调用签到接口 /api/user/sign_in');
                const signInResult = await tempPage.evaluate(async (cookieStr) => {
                    const response = await fetch('https://anyrouter.top/api/user/sign_in', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json, text/plain, */*',
                            'cache-control': 'no-store',
                            'cookie': cookieStr
                        }
                    });
                    return await response.json();
                }, cookieString);

                console.log('自动检查签到结果:', signInResult);

                // 获取用户信息
                console.log('自动检查：调用 /api/user/self 获取用户信息');
                const userInfo = await tempPage.evaluate(async (cookieStr, userId) => {
                    const headers = {
                        'accept': 'application/json, text/plain, */*',
                        'cache-control': 'no-store',
                        'cookie': cookieStr
                    };

                    if (userId) {
                        headers['new-api-user'] = String(userId);
                    }

                    const response = await fetch('https://anyrouter.top/api/user/self', {
                        method: 'GET',
                        headers: headers
                    });
                    const data = await response.json();
                    return data;
                }, cookieString, userId);

                // 提取余额信息
                const quota = userInfo?.data?.quota || 0;
                const balance = `$${(quota / 500000).toFixed(2)}`;
                console.log(`自动检查：计算余额 quota=${quota}, balance=${balance}`);

                // 判断签到是否成功
                const signInSuccess = signInResult?.success === true;
                const rewardMessage = signInSuccess ? '签到成功' : (signInResult?.message || '签到状态未知');

                const checkResult = {
                    success: true,
                    balance: balance,
                    reward: signInSuccess ? '已签到' : '无',
                    message: rewardMessage
                };

                console.log('自动检查结果:', checkResult);

                // 保存更新后的 Cookie
                const updatedCookies = await tempPage.cookies();
                await saveCookies(updatedCookies, userId);

                // 关闭临时浏览器
                await tempBrowser.close();

                // 记录结果
                const today = moment().format('YYYY-MM-DD HH:mm:ss');
                const status = checkResult.success ? 'success' : 'failed';

                await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO check_records
                            (date, status, balance, reward, message)
                            VALUES (?, ?, ?, ?, ?)`,
                        [today, status, checkResult.balance, checkResult.reward, checkResult.message],
                        function(err) {
                            if (err) {
                                console.error('保存记录失败:', err);
                                reject(err);
                            } else {
                                console.log('自动检查记录已保存到数据库');
                                resolve();
                            }
                        });
                });

                return;

            } catch (error) {
                console.error('使用 Cookie 自动检查失败:', error);

                // 如果是 Cookie 过期，清除
                if (error.message && error.message.includes('session Cookie')) {
                    await clearCookies();
                    console.log('自动检查：Cookie 已过期并已清除');
                }
                return;
            }
        }

        // 如果没有 Cookie，跳过本次检查
        console.log('自动检查：未找到登录状态，跳过本次检查');

    } catch (error) {
        console.error('自动检查失败:', error);
    }
}

// 定时任务 - 每两小时自动检查一次
cron.schedule('0 */2 * * *', async () => {
    console.log('开始执行每两小时自动检查任务...');
    await executeAutoCheck();
});

// 定时任务 - 每天早上6点执行
cron.schedule('0 6 * * *', async () => {
    console.log('开始执行每日检查任务...');

    if (!userCredentials) {
        // 从数据库获取凭据
        db.get('SELECT login_type, username, password, use_github FROM user_settings ORDER BY id DESC LIMIT 1', async (err, row) => {
            if (err || !row) {
                console.error('没有找到登录信息，跳过检查');
                return;
            }
            userCredentials = row;
            await executeScheduledCheck();
        });
    } else {
        await executeScheduledCheck();
    }
});

async function executeScheduledCheck() {
    const bot = new AnyRouterBot();
    try {
        await bot.init();

        let loginResult;
        if (userCredentials.use_github) {
            // 使用GitHub OAuth登录
            loginResult = await bot.loginWithGitHub();
        } else {
            // 使用传统用户名密码登录
            loginResult = await bot.login(userCredentials.username, userCredentials.password);
        }

        if (!loginResult.success) {
            console.error('定时任务登录失败:', loginResult.message);
            await bot.close();
            return;
        }

        const checkResult = await bot.checkDailyReward();
        console.log('定时检查结果:', checkResult);

        // 记录结果
        const today = moment().format('YYYY-MM-DD HH:mm:ss');
        const status = checkResult.success ? 'success' : 'failed';

        db.run(`INSERT INTO check_records
                (date, status, balance, reward, message)
                VALUES (?, ?, ?, ?, ?)`,
            [today, status, checkResult.balance, checkResult.reward, checkResult.message],
            function(err) {
                if (err) {
                    console.error('保存记录失败:', err);
                } else {
                    console.log('记录保存成功');
                }
            });

        await bot.close();

    } catch (error) {
        console.error('定时任务执行错误:', error);
        await bot.close();
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('每日检查任务已设置为早上6点执行');
});

// 优雅关闭
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('数据库连接已关闭');
        process.exit(0);
    });
});