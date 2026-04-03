import { chromium } from '@playwright/test';

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    console.log("Navigating to localhost:3000...");
    await page.goto('http://localhost:3000');
    
    console.log("Waiting for input...");
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    const input = page.locator('textarea').first();
    await input.fill('car toys');
    await input.press('Enter');
    console.log("Submitted query...");
    
    // Wait for the response to start showing
    console.log("Waiting for assistant response...");
    await page.waitForSelector('[data-role="assistant"]', { timeout: 15000 });
    
    // Wait for "Thinking" to finish if possible, or just wait a bit more
    await page.waitForTimeout(5000);
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: '/home/himanshu/.gemini/antigravity/brain/d10bb8d4-171d-44af-ab31-d4c706a05128/chat_response_verified.png' });
    
    const assistantMessages = await page.$$eval('[data-role="assistant"]', els => els.map(e => e.innerText));
    console.log("Assistant messages:", assistantMessages);
    
    await browser.close();
    console.log("Done");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
})();
