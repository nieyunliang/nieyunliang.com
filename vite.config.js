import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import path from 'path'
import htmlPlugin from 'vite-plugin-html-config'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://170.106.152.19',
        rewrite: path => path.replace('/api', '')
      }
    }
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
  },
  plugins: [
    react(),
    viteCompression(),
    htmlPlugin({
      scripts: [
        {
          content: `
						var _hmt = _hmt || [];
            (function () {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?e136f7bf7934ff74190e817043cb4727";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(hm, s);
            })();
						`
        }
      ]
    })
  ]
})
