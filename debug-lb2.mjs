import puppeteer from 'puppeteer-core'
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const b = await puppeteer.launch({executablePath: chrome, headless: 'new'})
const p = await b.newPage()
await p.setViewport({width: 390, height: 900})
await p.goto('http://localhost:3000', {waitUntil: 'networkidle0'})
await p.click('.g-item')
await new Promise(r => setTimeout(r, 800))
const info = await p.evaluate(() => {
  const lb = document.querySelector('.lightbox')
  const cs = getComputedStyle(lb)
  return {opacity: cs.opacity, position: cs.position, zIndex: cs.zIndex, classes: lb.className, hidden: lb.hidden}
})
console.log(info)
await p.screenshot({path: './temporary screenshots/debug-full.png'})
await b.close()
