import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { restaurantJsonLd } from './src/schema.ts'

// Put the schema.org data in the static HTML, where crawlers read it without
// running any JavaScript.
const jsonLd = (): Plugin => ({
  name: 'restaurant-json-ld',
  transformIndexHtml: (html) =>
    html.replace(
      '<!--json-ld-->',
      `<script type="application/ld+json">${JSON.stringify(restaurantJsonLd()).replace(/</g, '\\u003c')}</script>`,
    ),
})

export default defineConfig({
  // Relative asset paths, so the build works from any folder of any static host.
  base: './',
  plugins: [react(), jsonLd()],
})
