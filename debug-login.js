const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 创建调试日志文件
const debugLogPath = path.join(__dirname, 'login-debug.md');
let debugLog = '# AnyRouter 登录调试日志\n\n';
debugLog += `生成时间: ${new Date().toLocaleString()}\n\n`;

// 保存日志到文件
function saveDebugLog() {
    fs.writeFileSync(debugLogPath, debugLog, 'utf-8');
    console.log(`\n调试日志已保存到: ${debugLogPath}`);
}

// 添加日志
function addLog(section, content) {
    debugLog += `## ${section}\n\n${content}\n\n`;
    console.log(`\n=== ${section} ===`);
    console.log(content);
}

async function debugLogin() {
    console.log('🔍 开始调试登录流程...');
    console.log('请在弹出的浏览器中完成登录操作');

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        devtools: false
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // 存储所有网络请求
    const requests = [];
    const responses = [];

    // 监听网络请求
    page.on('request', request => {
        const url = request.url();
        const method = request.method();

        // 只记录API请求
        if (url.includes('anyrouter.top/api') || url.includes('/api/')) {
            const headers = request.headers();
            requests.push({
                url: url,
                method: method,
                headers: headers,
                postData: request.postData(),
                timestamp: new Date().toISOString()
            });

            console.log(`📤 请求: ${method} ${url}`);
        }
    });

    // 监听网络响应
    page.on('response', async response => {
        const url = response.url();
        const status = response.status();

        // 只记录API响应
        if (url.includes('anyrouter.top/api') || url.includes('/api/')) {
            try {
                const contentType = response.headers()['content-type'] || '';
                let responseData = null;

                if (contentType.includes('application/json')) {
                    responseData = await response.json();
                } else {
                    responseData = await response.text();
                }

                responses.push({
                    url: url,
                    status: status,
                    headers: response.headers(),
                    data: responseData,
                    timestamp: new Date().toISOString()
                });

                console.log(`📥 响应: ${status} ${url}`);
                if (responseData) {
                    console.log(`   数据:`, JSON.stringify(responseData, null, 2).substring(0, 200));
                }
            } catch (error) {
                console.log(`   ⚠️ 无法解析响应: ${error.message}`);
            }
        }
    });

    // 访问登录页面
    addLog('步骤 1: 访问网站', '正在访问 https://anyrouter.top');
    await page.goto('https://anyrouter.top', { waitUntil: 'networkidle2' });

    // 记录初始页面信息
    const initialUrl = page.url();
    addLog('初始页面URL', `\`${initialUrl}\``);

    console.log('\n⏳ 等待用户完成登录...');
    console.log('提示：请在浏览器中完成登录操作');
    console.log('登录完成后，程序将自动继续（60秒超时）\n');

    // 等待URL变化（表示登录成功）
    try {
        await page.waitForFunction(
            (initialUrl) => {
                const currentUrl = window.location.href;
                return !currentUrl.includes('/login') &&
                       (currentUrl.includes('dashboard') ||
                        currentUrl.includes('home') ||
                        currentUrl.includes('console') ||
                        currentUrl !== initialUrl);
            },
            { timeout: 60000 },
            initialUrl
        );

        console.log('✅ 检测到登录成功！');
    } catch (error) {
        console.log('⏱️ 等待超时，继续分析当前页面...');
    }

    // 等待额外的网络请求完成
    await page.waitForTimeout(3000);

    // 记录登录后的URL
    const loggedInUrl = page.url();
    addLog('登录后URL', `\`${loggedInUrl}\``);

    // 获取页面上所有包含 $ 符号的元素
    const balanceElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const results = [];

        elements.forEach((el, index) => {
            const text = el.textContent.trim();
            if (text.includes('$') && text.length < 50) {
                results.push({
                    tagName: el.tagName,
                    className: el.className,
                    id: el.id,
                    text: text,
                    innerHTML: el.innerHTML.substring(0, 200)
                });
            }
        });

        return results;
    });

    if (balanceElements.length > 0) {
        let balanceLog = '找到以下包含 $ 的元素：\n\n';
        balanceElements.forEach((el, index) => {
            balanceLog += `### 元素 ${index + 1}\n`;
            balanceLog += `- 标签: \`${el.tagName}\`\n`;
            balanceLog += `- Class: \`${el.className}\`\n`;
            balanceLog += `- ID: \`${el.id}\`\n`;
            balanceLog += `- 文本: **${el.text}**\n`;
            balanceLog += `- HTML: \`${el.innerHTML}\`\n\n`;
        });
        addLog('页面余额元素', balanceLog);
    } else {
        addLog('页面余额元素', '未找到包含 $ 的元素');
    }

    // 获取所有Cookie
    const cookies = await page.cookies();
    let cookieLog = '```json\n';
    cookieLog += JSON.stringify(cookies.map(c => ({
        name: c.name,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly
    })), null, 2);
    cookieLog += '\n```';
    addLog('Cookies 信息', cookieLog);

    // 整理并记录所有API请求
    if (requests.length > 0) {
        let requestLog = '```json\n';
        requestLog += JSON.stringify(requests, null, 2);
        requestLog += '\n```';
        addLog('所有API请求', requestLog);
    } else {
        addLog('所有API请求', '未捕获到API请求');
    }

    // 整理并记录所有API响应
    if (responses.length > 0) {
        let responseLog = '';
        responses.forEach((resp, index) => {
            responseLog += `### ${index + 1}. ${resp.url}\n\n`;
            responseLog += `- 状态码: ${resp.status}\n`;
            responseLog += `- 时间: ${resp.timestamp}\n`;
            responseLog += `- 数据:\n\`\`\`json\n${JSON.stringify(resp.data, null, 2)}\n\`\`\`\n\n`;
        });
        addLog('所有API响应', responseLog);
    } else {
        addLog('所有API响应', '未捕获到API响应');
    }

    // 分析并总结
    let summaryLog = '';

    // 查找可能的余额API
    const balanceAPIs = responses.filter(r =>
        r.url.includes('/user') ||
        r.url.includes('/balance') ||
        r.url.includes('/quota') ||
        r.url.includes('/self') ||
        r.url.includes('/status')
    );

    if (balanceAPIs.length > 0) {
        summaryLog += '### 可能包含余额信息的API：\n\n';
        balanceAPIs.forEach(api => {
            summaryLog += `- **${api.url}**\n`;
            summaryLog += `  - 状态: ${api.status}\n`;

            // 检查返回数据中是否包含quota、balance等关键字
            const dataStr = JSON.stringify(api.data);
            if (dataStr.includes('quota')) {
                summaryLog += `  - ✅ 包含 "quota" 字段\n`;
            }
            if (dataStr.includes('balance')) {
                summaryLog += `  - ✅ 包含 "balance" 字段\n`;
            }
            if (dataStr.includes('$')) {
                summaryLog += `  - ✅ 包含 "$" 符号\n`;
            }
            summaryLog += '\n';
        });
    } else {
        summaryLog += '### ⚠️ 未找到明显的余额API\n\n';
    }

    // 查找签到API
    const signInAPIs = responses.filter(r =>
        r.url.includes('/sign') ||
        r.url.includes('/checkin') ||
        r.url.includes('/daily')
    );

    if (signInAPIs.length > 0) {
        summaryLog += '### 可能的签到API：\n\n';
        signInAPIs.forEach(api => {
            summaryLog += `- **${api.url}**\n`;
            summaryLog += `  - 状态: ${api.status}\n\n`;
        });
    }

    addLog('📊 分析总结', summaryLog);

    // 保存日志
    saveDebugLog();

    console.log('\n✅ 调试完成！');
    console.log('📄 详细日志已保存到 login-debug.md');
    console.log('🔍 请查看日志文件了解详细信息');
    console.log('\n⏸️  浏览器将保持打开状态30秒，您可以继续查看...');

    await page.waitForTimeout(30000);

    await browser.close();
    console.log('\n👋 浏览器已关闭');
}

// 运行调试
debugLogin().catch(error => {
    console.error('❌ 调试过程出错:', error);
    addLog('错误信息', `\`\`\`\n${error.stack}\n\`\`\``);
    saveDebugLog();
    process.exit(1);
});
