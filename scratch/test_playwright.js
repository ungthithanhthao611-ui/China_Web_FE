import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.message}`);
  });

  console.log('Navigating to honors page...');
  await page.goto('http://localhost:5173/honors#page3');
  
  console.log('Waiting for network idle...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // extra wait for state updates

  const techGridHtml = await page.evaluate(() => {
    const el = document.querySelector('.tech-grid');
    return el ? el.outerHTML : 'NOT FOUND';
  });

  console.log('--- Tech Grid HTML ---');
  console.log(techGridHtml);
  console.log('----------------------');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
