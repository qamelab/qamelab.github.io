import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://qamelab.github.io',
  // If deploying to a subpath, uncomment:
  // base: '/qame-lab',
  output: 'static',
  build: {
    assets: '_assets',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
