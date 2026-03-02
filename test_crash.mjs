import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR LOG:', msg.text());
        } else {
            console.log('PAGE LOG:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('FATAL PAGE ERROR:', error.message);
    });

    console.log('Navigating to welcome screen...');
    await page.goto('http://localhost:5173/welcome?clientId=CLT-12345&shopId=SHOP-01&ticketId=TCK-9999&name=John', { waitUntil: 'networkidle0' });

    console.log('Waiting for button...');
    await page.waitForSelector('button');

    console.log('Clicking "View Vehicle Status"...');
    // Find the button with text "View Vehicle Status"
    const buttons = await page.$$('button');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('View Vehicle Status')) {
            await btn.click();
            break;
        }
    }

    console.log('Waiting for crash or navigation...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('Done.');
    await browser.close();
})();
