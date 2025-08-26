import { defineConfig } from 'vite'
import devServer, { defaultOptions } from '../src'
import cloudflareAdapter from '../src/adapter/cloudflare'

export default defineConfig(async () => {
  return {
    base: '/docs/',
    plugins: [
      devServer({
        entry: '../e2e-custom-base/mock/worker.ts',
        base: '/docs/',
        exclude: [...defaultOptions.exclude, '/app/**'],
        adapter: cloudflareAdapter,
      }),
    ],
  }
})
