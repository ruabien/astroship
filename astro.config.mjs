import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Chế độ chạy trên Cloudflare
  output: 'server', 
  
  adapter: cloudflare({
    // Bật session theo cách chính thức
    session: true, 
  }),

  // CHỖ CẦN SỬA: Xóa bỏ mục experimental cũ vì Astro 5 đã hỗ trợ chính thức
  // Chúng ta chỉ giữ lại phần tối ưu hình ảnh
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
