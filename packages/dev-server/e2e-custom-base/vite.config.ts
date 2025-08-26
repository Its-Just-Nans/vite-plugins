import { defineConfig } from 'vite'
import devServer, { defaultOptions } from '../src'
import cloudflareAdapter from '../src/adapter/cloudflare'

export default defineConfig(async () => {
  return {
    base: process.env.VBASE, // possible custom base
    plugins: [
      devServer({
        entry: './mock/worker.ts',
        base: '/docs/',
        exclude: [...defaultOptions.exclude, '/app/**'],
        adapter: cloudflareAdapter,
      }),
    ],
  }
})
