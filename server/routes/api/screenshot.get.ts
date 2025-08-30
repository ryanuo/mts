// server/api/screenshot.get.ts
import { createError, defineEventHandler, getQuery } from 'h3'
import { usePuppeteer } from '../../utils/usePuppeteer'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url param' })
  }

  try {
    const browser = await usePuppeteer()
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
    await page.waitForNetworkIdle()

    const screenshot = await page.screenshot({ type: 'png', fullPage: true })
    await browser.close()

    event.node.res.setHeader('Content-Type', 'image/png')
    return screenshot
  }
  catch (err: any) {
    console.error('Screenshot failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Screenshot failed' })
  }
})
