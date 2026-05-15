import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  // THÊM DÒNG NÀY (thay bằng link .pages.dev của bạn nếu có, hoặc để tạm link ảo)
  site: 'https://astroship.pages.dev', 
  
  integrations: [
    mdx(), 
    sitemap(), 
    icon()
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
