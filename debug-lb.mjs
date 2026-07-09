import puppeteer from 'puppeteer-core'
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const b = await puppeteer.launch({executablePath: chrome, headless: 'new'})
const p = await b.newPage()
await p.setViewport({width: 390, height: 900})
await p.goto('http://localhost:3000', {waitUntil: 'networkidle0'})
await p.click('.g-item')
await new Promise(r => setTimeout(r, 400))
const info = await p.evaluate(() => {
  const rect = el => { const r = el.getBoundingClientRect(); return {w: r.width, h: r.height, top: r.top} }
  return {
    lightbox: rect(document.querySelector('.lightbox')),
    stage: rect(document.querySelector('.lb-stage')),
    track: rect(document.querySelector('.lb-track')),
    lbStyle: getComputedStyle(document.querySelector('.lightbox')).cssText.slice(0,0) || getComputedStyle(document.querySelector('.lightbox')).display,
  }
})
console.log(JSON.stringify(info, null, 2))
await b.close()
