import { test, expect } from '@playwright/test'

const hbase = process.env.HBASE ?? '/'
const vbase = process.env.VBASE ?? '/'
const BASE_TEST = '/docs/'

test('Static /docs/ enpoint', async ({ page }) => {
  const response = await page.goto('/docs/')
  if (hbase == '/') {
    // the route is not in the worker.ts
    expect(response?.status()).toBe(404)
    expect(await response?.text()).toContain('404 Not Found')
    return
  } else if (hbase == BASE_TEST && vbase == '/') {
    // final route is /
    expect(response?.status()).toBe(200)
    const txt = await response?.text()
    expect(txt).toContain('<h1>Hello Vite!</h1>')
    expect(txt).toContain('<script>import("/@vite/client")</script>')
    return
  } else if (hbase == BASE_TEST && vbase == BASE_TEST) {
    // final route is /
    expect(response?.status()).toBe(200)
    const txt = await response?.text()
    expect(txt).toContain('<h1>Hello Vite!</h1>')
    expect(txt).toContain('<script>import("/docs/@vite/client")</script>')
    return
  } else if (hbase == BASE_TEST && vbase == '/test/') {
    // final route is /
    expect(response?.status()).toBe(200)
    const txt = await response?.text()
    expect(txt).toContain('<h1>Hello Vite!</h1>')
    expect(txt).toContain('<script>import("/test/@vite/client")</script>')
    return
  }
  expect(true).toBe(false) // never
})

test('Should contain an injected script tag', async ({ page }) => {
  const response = await page.goto('/')
  if (hbase == BASE_TEST) {
    expect(response?.status()).toBe(404)
    expect(await response?.text()).toContain('not handled by the hono server')
    return
  }
  expect(response?.status()).toBe(200)

  const lastScriptTag = await page.$('script:last-of-type')
  expect(lastScriptTag).not.toBeNull()

  const nonce = await lastScriptTag?.getAttribute('nonce')
  expect(nonce).toBeNull()

  const content = await lastScriptTag?.textContent()

  const vbase = process.env.VBASE ?? '/'
  expect(content).toBe(`import("${vbase}@vite/client")`)
})

test('Dynamic /path endpoint behind hono base', async ({ page }) => {
  const hbase = process.env.HBASE ?? '/'
  const response = await page.goto(`${hbase}path`)
  expect(response?.status()).toBe(200)

  const data = await response?.json()

  expect(data.path).toBe('/path')
  // tests run on port 6173 - see e2e-custom-base/playwright.config.ts
  expect(data.url).toBe('http://localhost:6173/path')
})

test('Dynamic /path endpoint behind vite base', async ({ page }) => {
  // tests run on port 6173 - see e2e-custom-base/playwright.config.ts
  const response = await page.goto(`${vbase}path`)
  if (hbase == '/' && vbase == BASE_TEST) {
    // url is /docs/path
    // this path does not exists in the worker.ts
    expect(response?.status()).toBe(404)
    expect(await response?.text()).toContain('404 Not Found')
    return
  } else if (hbase == '/' && vbase == '/') {
    // url is /path
    expect(response?.status()).toBe(200)
    const data = await response?.json()
    expect(data.path).toBe('/path')
    expect(data.url).toBe('http://localhost:6173/path')
    return
  } else if (hbase == BASE_TEST && vbase == '/') {
    // url is /path
    // hono serves only /docs/*
    expect(response?.status()).toBe(404)
    expect(await response?.text()).toContain('not handled by the hono server')
    return
  } else if (hbase == BASE_TEST && vbase == BASE_TEST) {
    // url is /docs/path
    // hono serves only /docs/* but vite does the same thing
    expect(response?.status()).toBe(200)
    const data = await response?.json()
    expect(data.path).toBe('/path')
    expect(data.url).toBe('http://localhost:6173/path')
    return
  } else if (hbase == BASE_TEST && vbase == '/test/') {
    // url is /test/path
    // hono serves only /docs/*
    expect(response?.status()).toBe(404)
    expect(await response?.text()).toContain('not handled by the hono server')
    return
  }
  expect(true).toBe(false) // never
})

test('Should exclude the file specified in the exclude option', async ({ page }) => {
  let response = await page.goto('/file.ts')
  expect(response?.status()).toBe(404)

  response = await page.goto('/app/foo')
  expect(response?.status()).toBe(404)

  response = await page.goto('/favicon.ico')
  expect(response?.status()).toBe(404)

  response = await page.goto('/static/foo.png')
  expect(response?.status()).toBe(404)
})

test('Static hono-logo.png endpoint at /', async ({ page }) => {
  const res = await page.goto('/hono-logo.png')
  if (hbase == '/') {
    expect(res?.status()).toBe(200)
    return
  }
  expect(res?.status()).toBe(404)
  expect(await res?.text()).toContain('not handled by the hono server')
})

test('Dynamic hono-logo.png endpoint behind the hono base', async ({ page }) => {
  const res = await page.goto(`${hbase}hono-logo.png`)
  expect(res?.status()).toBe(200)
})
