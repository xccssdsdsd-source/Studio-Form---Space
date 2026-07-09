import puppeteer from 'puppeteer-core'
import {mkdir} from 'fs/promises'
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const width = Number(process.argv[2]) || 1440
const name = process.argv[3] || `lightbox-${width}`
await mkdir('./temporary screenshots', {recursive: true})
const b = await puppeteer.launch({executablePath: chrome, headless: 'new'})
const p = await b.newPage()
await p.setViewport({width, height: 900, deviceScaleFactor: 1})
await p.goto('http://localhost:3000', {waitUntil: 'networkidle0'})
await p.evaluate(() => document.querySelector('.g-item').scrollIntoView({block: 'center'}))
await new Promise(r => setTimeout(r, 300))
await p.click('.g-item')
await new Promise(r => setTimeout(r, 600))
await p.screenshot({path: `./temporary screenshots/${name}.png`})
await p.click('.lb-next')
await new Promise(r => setTimeout(r, 600))
await p.screenshot({path: `./temporary screenshots/${name}-next.png`})
await b.close()
console.log('done', name)
