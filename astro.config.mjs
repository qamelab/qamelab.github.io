import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://qamelab.org',
  // If deploying to a subpath, uncomment:
  // base: '/qame-lab',
  output: 'static',
  integrations: [sitemap()],
  build: {
    assets: '_assets',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
