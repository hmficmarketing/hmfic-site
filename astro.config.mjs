import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https://hmficmarketing.com',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: true,
  }),
  integrations: [mdx()],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
