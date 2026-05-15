import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon'; 

export default defineConfig({
  // Đăng ký các thành phần mở rộng
  integrations: [
    mdx(), 
    sitemap(), 
    icon() // Thêm dòng này để giải quyết lỗi virtual:astro-icon
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
