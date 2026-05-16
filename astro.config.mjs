import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import cloudflare from '@astrojs/cloudflare'; // 1. Thêm lại dòng này

export default defineConfig({
  site: 'https://hotro.online', // Thay bằng link thật của bạn
  
  output: 'server', // 2. Chuyển sang chế độ Server để làm trang bán hàng
  adapter: cloudflare({
    session: true, // 3. Bật tính năng Session chính thức
  }),

  integrations: [mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
