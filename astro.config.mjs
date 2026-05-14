import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Chế độ chạy trên Cloudflare
  output: 'server', 
  
  adapter: cloudflare({
    // Bật tính năng session (đã là chính thức, không cần cờ experimental)
    session: true, 
  }),

  // Tối ưu hình ảnh lúc build (giữ lại để web tải nhanh hơn)
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
