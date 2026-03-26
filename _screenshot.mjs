import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// Screenshot 1: Hero (top of page)
await page.screenshot({ path: "_mobile_hero.png", fullPage: false });

// Screenshot 2: Scroll to features
await page.evaluate(() => window.scrollBy(0, 900));
await page.waitForTimeout(500);
await page.screenshot({ path: "_mobile_features.png", fullPage: false });

// Screenshot 3: Scroll to bento
await page.evaluate(() => window.scrollBy(0, 900));
await page.waitForTimeout(500);
await page.screenshot({ path: "_mobile_bento.png", fullPage: false });

// Screenshot 4: Scroll to footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
await page.screenshot({ path: "_mobile_footer.png", fullPage: false });

// Full page screenshot
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.screenshot({ path: "_mobile_full.png", fullPage: true });

await browser.close();
console.log("Done! Screenshots saved.");
