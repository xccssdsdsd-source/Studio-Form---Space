import puppeteer from 'puppeteer-core'
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const b = await puppeteer.launch({executablePath: chrome, headless: 'new'})
const p = await b.newPage()
await p.setViewport({width: 390, height: 900})
await p.goto('http://localhost:3000', {waitUntil: 'networkidle0'})
await p.click('.g-item')
await new Promise(r => setTimeout(r, 800))
await p.evaluate(() => {
  document.querySelectorAll('.lightbox,.lb-stage,.lb-track,.lb-slide,.lb-slide img').forEach(el => el.style.outline = '3px solid red')
})
await p.screenshot({path: './temporary screenshots/debug-outline.png'})
await b.close()
