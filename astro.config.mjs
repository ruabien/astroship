import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon'; // Thêm dòng này

export default defineConfig({
  // Tích hợp các công cụ vào Astro
  integrations: [
    mdx(), 
    sitemap(), 
    icon() // Thêm dòng này để sửa lỗi virtual:astro-icon
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: '@', replacement: '/src' }
      ],
    },
  },
});
