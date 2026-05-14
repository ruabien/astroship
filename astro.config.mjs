import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Chế độ chạy trên Cloudflare
  output: 'server', 
  
  adapter: cloudflare({
    // Bật session chính thức (không nằm trong mục experimental)
    session: true, 
  }),

  // Cấu hình hình ảnh tiêu chuẩn cho Astro 5
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        imageService: 'compile',
      },
    },
  },

  integrations: [mdx(), sitemap()],
  
  vite: {
    plugins: [tailwindcss()],
  },
});
