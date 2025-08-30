// server/utils/usePuppeteer.ts
import process from 'node:process'

export async function usePuppeteer() {
  if (process.env.NETLIFY) {
    // Netlify 无头环境
    const puppeteer = await import('puppeteer-core')
    const chromium = await import('@sparticuz/chromium')

    return puppeteer.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1280, height: 800 }, // 直接设置
      executablePath: await chromium.default.executablePath(),
      headless: true, // 直接设置
    })
  }
  else {
    // 本地开发（直接用 Puppeteer 自带 Chromium）
    const puppeteer = await import('puppeteer')
    return puppeteer.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  }
}
