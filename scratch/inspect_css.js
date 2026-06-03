import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/honors#page3');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const cardStyles = await page.evaluate(() => {
    const card = document.querySelector('.tech-card');
    if (!card) return 'Card not found';
    
    const media = card.querySelector('.tech-card__media');
    const img = card.querySelector('img');
    
    const getStyles = (el) => {
      if (!el) return 'Element not found';
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: style.width,
        height: style.height,
        position: style.position,
        overflow: style.overflow,
        maxHeight: style.maxHeight,
        maxWidth: style.maxWidth,
      };
    };

    return {
      card: getStyles(card),
      media: getStyles(media),
      img: getStyles(img)
    };
  });

  console.log('Computed Styles:');
  console.log(JSON.stringify(cardStyles, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
