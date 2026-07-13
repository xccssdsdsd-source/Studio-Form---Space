import puppeteer from 'puppeteer-core'
import {mkdir} from 'fs/promises'

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const url = process.argv[2] || 'http://localhost:3000'
const width = Number(process.argv[3]) || 1440
await mkdir('./temporary screenshots', {recursive: true})
const browser = await puppeteer.launch({executablePath: chrome, headless: 'new'})
const page = await browser.newPage()
await page.setViewport({width, height: 900, deviceScaleFactor: 1})
await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 10000})
await page.evaluate(async () => {
  await new Promise(res => {
    let y = 0
    const step = () => {
      window.scrollTo(0, y)
      y += window.innerHeight * 0.5
      if (y < document.body.scrollHeight) setTimeout(step, 90)
      else { window.scrollTo(0, 0); setTimeout(res, 400) }
    }
    step()
  })
})
await new Promise(r => setTimeout(r, 900))
await page.screenshot({path: `./temporary screenshots/full-${width}.png`, fullPage: true})
await browser.close()
console.log('done', width)
