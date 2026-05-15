import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon'; // PHẢI CÓ DÒNG NÀY

export default defineConfig({
  integrations: [
    mdx(), 
    sitemap(), 
    icon() // PHẢI CÓ DÒNG NÀY
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
