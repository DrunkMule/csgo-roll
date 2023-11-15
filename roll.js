const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const proxy = {
    ip: '149.51.219.125',
    port: '5259',
    username: 'PXY_765VAMLX',
    password: 'uh2ccsioid'
};

const chromeFlags = [
    '--no-sandbox',
    '--disable-extensions',
    '--headless'
];


const executeTask = async function() {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            ...chromeFlags,
            `--proxy-server=http://${proxy.ip}:${proxy.port}`,
        ],
        defaultViewport: null,
    });
    
    const page = await browser.newPage();

    await page.authenticate({
        username: proxy.username,
        password: proxy.password
    });

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36");

    await page.evaluateOnNewDocument(() => {
        // Fake Plugins
        const fakePlugins = [
            { name: 'plugin1', description: '' },
            { name: 'plugin2', description: '' },
            { name: 'plugin3', description: '' },
            { name: 'plugin4', description: '' },
            { name: 'plugin5', description: '' }
        ];

        Object.defineProperty(navigator, 'plugins', {
            get: () => fakePlugins,
            configurable: true
        });

        Object.setPrototypeOf(navigator.plugins, PluginArray.prototype);
    
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => {
            const blockedPermissions = [
                'notifications', 'persistent-storage', 'push', 'midi', 
                'camera', 'microphone', 'geolocation', 'encrypted-media'
            ];

            if (blockedPermissions.includes(parameters.name)) {
                return Promise.resolve({ state: 'denied' });
            }
            return originalQuery(parameters);
        };
    });

    const specificImageUrlPart = 'https://avatars.akamai.steamstatic.com/8f6fd8a17fbd49103f61212efb74630e767e789f_full.jpg';
    const webhookUrl = 'https://discord.com/api/webhooks/1173959657342124042/6KQGQUKBXw8YhNa_l4zXhirBfvUMj3IPx4i0WG0epvYb2MrGhQ84M0AJbujz6rzL5yxv';
    const statuswebhook = 'https://discord.com/api/webhooks/1174321424412971008/ZetgQ22-J7bloSRsfqLr13lUt4qcUqGYS45-UCDKhE_7ohTht-UVEu9QsfoGpuHyL4Au'

    const sendPeriodicMessage = async () => {
        try {
            await fetch(statuswebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: "Venter på Juicy...",
                }),
            });
        } catch (error) {
            console.error("Failed to send periodic message:", error);
        }
    };

    // Set the interval before the while loop
    setInterval(sendPeriodicMessage, 300000);

    await page.goto('https://www.csgoroll.com/en/pvp?t=unboxing', { waitUntil: 'networkidle0', timeout: 60000 });
    let found = false;
    while (!found) {
        await page.evaluate(() => {
            let elements = Array.from(document.querySelectorAll('span'));
            let targetElement = elements.find(element => element.textContent === 'Sort by Price');
            if (targetElement) {
                targetElement.click({ waitUntil: 'networkidle0', timeout: 60000 });
            }
        });
    
        const avatarUrls = await page.evaluate(() => {
            const avatars = Array.from(document.querySelectorAll('.img-avatar'));
            return avatars.map(avatar => avatar.style.backgroundImage.slice(5, -2));
        });

        const specificImageUrl = avatarUrls.find(url => url.includes(specificImageUrlPart));
        found = specificImageUrl !== undefined;
        if (found) {
            await page.evaluate(async (webhookUrl, specificImageUrl) => {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `@everyone
JUICY ER ONLINE: ${specificImageUrl}`,
                    }),
                });
            }, webhookUrl, specificImageUrl);
            break;
        } else {
            await page.waitForTimeout(5000);
        }
    }
};

executeTask();
