// server/api/screenshot.get.ts
import process from 'node:process'
import { createError, defineEventHandler, getQuery } from 'h3'
import { usePuppeteer } from '../../utils/usePuppeteer'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let target = ''

  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    target = `http://localhost:${process.env.PORT || 3000}?config=${query.config}`
  }
  else {
    target = `https://mts.ryanuo.cc?config=${query.config}`
  }

  if (!target) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url/config param' })
  }

  try {
    const browser = await usePuppeteer()
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    // 直接传入 target，无需解析
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 })
    await page.waitForNetworkIdle()

    const screenshot = await page.screenshot({ type: 'jpeg', fullPage: true, quality: 100 })
    await browser.close()

    event.node.res.setHeader('Content-Type', 'image/png')
    return screenshot
  }
  catch (err: any) {
    console.error('Screenshot failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Screenshot failed' })
  }
})
