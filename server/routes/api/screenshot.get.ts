import { Buffer } from 'node:buffer'
import process from 'node:process'
import { createError, defineEventHandler, getQuery } from 'h3'
import { usePuppeteer } from '../../utils/usePuppeteer'

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = query.config
  if (!config) {
    throw createError({ statusCode: 400, statusMessage: 'Missing config param' })
  }

  const isDev = process.env.NODE_ENV === 'development'
  const useBrowserless = !!process.env.BLESS_TOKEN
  const useOrigin = process.env.ORIGIN === 'true'

  const target = isDev
    ? `http://localhost:${process.env.PORT || 3000}?config=${config}`
    : `https://mts.ryanuo.cc?config=${config}`

  try {
    let screenshot: any

    if (isDev) {
      // 🔹 本地 Puppeteer
      const browser = await usePuppeteer()
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 800 })
      await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 })
      await page.waitForNetworkIdle()
      await sleep(2000)

      screenshot = await page.screenshot({ type: 'jpeg', fullPage: true, quality: 100 })
      await browser.close()

      event.node.res.setHeader('Content-Type', 'image/jpeg')
      return screenshot
    }

    if (useOrigin) {
      // 🔹 使用 https://github.com/ryanuo/screenshot 接口截图
      const originTarget = `https://mts.ryanuo.cc?config=${config}`
      const url = `https://sc27.netlify.app/.netlify/functions/screenshot?url=${originTarget}`
      const response = await fetch(url, { method: 'GET' })

      if (!response.ok) {
        throw new Error(`screenshot failed: ${response.status} ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      screenshot = Buffer.from(arrayBuffer)
    }
    else if (useBrowserless) {
      // 🔹 Browserless 截图
      const TOKEN = process.env.BLESS_TOKEN
      const url = `https://production-sfo.browserless.io/screenshot?token=${TOKEN}`
      const headers = {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      }
      const data = {
        url: target,
        options: {
          fullPage: true,
          type: 'png',
        },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Browserless screenshot failed: ${response.status} ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      screenshot = Buffer.from(arrayBuffer)
      return screenshot
    }
  }
  catch (err: any) {
    console.error('Screenshot failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Screenshot failed' })
  }
})
