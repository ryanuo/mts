// server/utils/usePuppeteer.ts
import process from 'node:process'

const chromeOptions = {
  headless: true,
  defaultViewport: {
    width: 1280,
    height: 720,
    deviceScaleFactor: 2,
  },
}
export async function usePuppeteer() {
  const isDev = process.env.NODE_ENV === 'development'

  const puppeteer = await import('puppeteer-core')

  // 暂时不使用
  // const useBrowserless = !!process.env.BLESS_TOKEN
  // if (useBrowserless) {
  //   // 👉 远程 browserless.io
  //   return puppeteer.connect({
  //     browserWSEndpoint: `wss://production-sfo.browserless.io?token=${process.env.BLESS_TOKEN}`,
  //   })
  // }

  if (isDev) {
    // 👉 本地开发用系统 Chrome
    return puppeteer.launch({
      executablePath: process.platform === 'win32'
        ? 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
        : process.platform === 'linux'
          ? '/usr/bin/google-chrome'
          : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ...chromeOptions,
    })
  }

  // 👉 fallback: 无 BLESS_TOKEN，走 @sparticuz/chromium
  const chromium = await import('@sparticuz/chromium')
  return puppeteer.launch({
    args: chromium.default.args,
    executablePath: await chromium.default.executablePath(),
    ...chromeOptions,
  })
}
