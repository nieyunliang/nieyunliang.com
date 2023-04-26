import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 8000,
		proxy: {
			'/api': {
				target: 'http://43.153.19.186:80',
				rewrite: path => path.replace('/api', ''),
			},
		},
	},
	resolve: {
		alias: [{find: '@', replacement: path.resolve(__dirname, 'src')}],
	},
})
