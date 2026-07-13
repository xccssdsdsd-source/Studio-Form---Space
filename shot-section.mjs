import puppeteer from 'puppeteer-core'
import {mkdir} from 'fs/promises'
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const sel = process.argv[2]
const name = process.argv[3] || 'section'
const url = process.argv[4] || 'http://localhost:3000'
await mkdir('./temporary screenshots', {recursive: true})
const b = await puppeteer.launch({executablePath: chrome, headless: 'new'})
const p = await b.newPage()
await p.setViewport({width: 1440, height: 900, deviceScaleFactor: 1})
await p.setRequestInterception(true)
p.on('request', request => request.url().startsWith('http://localhost') ? request.continue() : request.abort())
await p.goto(url, {waitUntil: 'domcontentloaded', timeout: 10000})
await p.evaluate((s) => document.querySelector(s).scrollIntoView({block: 'center'}), sel)
await new Promise(r => setTimeout(r, 1400))
const el = await p.$(sel)
await el.screenshot({path: `./temporary screenshots/${name}.png`})
await b.close()
console.log('done', name)
