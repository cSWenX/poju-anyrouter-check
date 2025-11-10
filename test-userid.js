// Test script to extract user ID from AnyRouter
const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();

async function testUserIdExtraction() {
    const db = new sqlite3.Database('anyrouter.db');

    // Load cookies from database
    const savedData = await new Promise((resolve, reject) => {
        db.get('SELECT cookies, user_id FROM cookies ORDER BY id DESC LIMIT 1', (err, row) => {
            if (err) reject(err);
            else if (row) {
                try {
                    resolve({ cookies: JSON.parse(row.cookies), userId: row.user_id });
                } catch (e) {
                    reject(e);
                }
            } else {
                resolve(null);
            }
        });
    });

    console.log('Saved user ID from DB:', savedData.userId);

    // Launch browser with cookies
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Set cookies
    if (savedData && savedData.cookies) {
        console.log('Setting cookies...');
        await page.setCookie(...savedData.cookies);
    }

    // Navigate to the site
    console.log('Navigating to anyrouter.top...');
    await page.goto('https://anyrouter.top', { waitUntil: 'networkidle2' });

    // Wait a bit for page to load
    await page.waitForTimeout(3000);

    // Try to extract user ID from localStorage
    console.log('\n=== Attempting to extract user ID ===');
    const userId = await page.evaluate(() => {
        console.log('=== Browser Console ===');

        // Check localStorage
        console.log('localStorage keys:', Object.keys(localStorage));
        const userStr = localStorage.getItem('user');
        console.log('localStorage.user:', userStr);

        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                console.log('Parsed user object:', user);
                return user.id || user.user_id || user.userId;
            } catch (e) {
                console.log('Error parsing localStorage.user:', e.message);
            }
        }

        // Check sessionStorage
        console.log('\nsessionStorage keys:', Object.keys(sessionStorage));
        const sessionUserStr = sessionStorage.getItem('user');
        console.log('sessionStorage.user:', sessionUserStr);

        if (sessionUserStr) {
            try {
                const user = JSON.parse(sessionUserStr);
                console.log('Parsed session user object:', user);
                return user.id || user.user_id || user.userId;
            } catch (e) {
                console.log('Error parsing sessionStorage.user:', e.message);
            }
        }

        // Try to find user ID in window object
        console.log('\nSearching window object...');
        if (typeof window.__INITIAL_STATE__ !== 'undefined') {
            console.log('window.__INITIAL_STATE__:', window.__INITIAL_STATE__);
        }
        if (typeof window.__USER__ !== 'undefined') {
            console.log('window.__USER__:', window.__USER__);
        }

        return null;
    });

    console.log('\n=== Result ===');
    console.log('Extracted user ID:', userId);

    if (!userId) {
        console.log('\n=== Trying API call to see user info ===');
        const cookies = await page.cookies();
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        // Try calling the API without user ID header
        const apiResult = await page.evaluate(async (cookieStr) => {
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
                return { error: e.message };
            }
        }, cookieString);

        console.log('API call without user ID header:', JSON.stringify(apiResult, null, 2));

        // Check if we can find the user ID in the page HTML or network requests
        console.log('\n=== Checking page HTML for user ID ===');
        const pageContent = await page.content();
        const userIdMatches = pageContent.match(/user[_-]?id["']?\s*:\s*["\']?(\d+)/gi);
        if (userIdMatches) {
            console.log('Found potential user ID patterns in HTML:', userIdMatches);
        } else {
            console.log('No user ID patterns found in HTML');
        }
    }

    console.log('\nKeeping browser open for manual inspection...');
    console.log('Press Ctrl+C to close');

    // Keep browser open
    await new Promise(() => {});
}

testUserIdExtraction().catch(console.error);
