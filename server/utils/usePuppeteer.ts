// server/utils/usePuppeteer.ts
import process from 'node:process'

export async function usePuppeteer() {
  const isDev = process.env.NODE_ENV === 'development'
  // Netlify 无头环境
  const puppeteer = await import('puppeteer-core')
  const chromium = await import('@sparticuz/chromium')

  return puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: { width: 1280, height: 800 }, // 直接设置
    executablePath: isDev ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : await chromium.default.executablePath(),
    headless: true, // 直接设置
  })
}
