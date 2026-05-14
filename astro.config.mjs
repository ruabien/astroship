import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Chế độ đầu ra cho Cloudflare
  output: 'server', 
  
  adapter: cloudflare({
    // Tắt tính năng session nếu bạn chưa cấu hình KV trên Cloudflare
    // Hoặc giữ nguyên nếu bạn muốn dùng, nhưng phải có cờ experimental bên dưới
    session: true, 
  }),

  // SỬA LỖI CHÍNH: Kích hoạt cờ thử nghiệm cho Session
  experimental: {
    session: true,
  },

  // Tối ưu hình ảnh lúc Build (để tránh lỗi Sharp trên Cloudflare Runtime)
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
