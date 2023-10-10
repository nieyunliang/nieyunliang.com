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
        target: 'http://ai.nieyunliang.com',
        rewrite: path => path.replace('/api', '')
      }
    }
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const modules = id.toString().split('node_modules/')[1].split('/')

            if (modules[1].includes('ant')) {
              return 'ant'
            } else if (modules[1].includes('react')) {
              return 'react'
            } else if (
              modules[1].includes('highlight') ||
              modules[1].includes('marked')
            ) {
              return 'code-highlight'
            } else if (modules[1].includes('lodash')) {
              return 'lodash'
            } else {
              console.log(modules[1])
              return 'vendor'
            }
          }

          return 'index'
        }
      }
    }
  },
  plugins: [
    react(),
    viteCompression(),
    process.env.NODE_ENV === 'production'
      ? htmlPlugin({
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
      : null
  ]
})
