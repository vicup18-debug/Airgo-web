const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  await page.goto('http://localhost:3000');
  
  await page.evaluate(() => {
    localStorage.setItem('airgo_user', JSON.stringify({ role: 'admin' }));
    localStorage.setItem('airgo_token', 'fake-token');
  });

  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'admin-screenshot.png' });
  await browser.close();
})();
