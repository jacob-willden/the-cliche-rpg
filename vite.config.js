import { resolve } from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// https://github.com/vitejs/vite/issues/378#issuecomment-768816653
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			input: {
				main: resolve('index.html'),
				javascript: resolve('javascript.html')
			},
			output: {
				entryFileNames: "assets/[name].js"
			}
		}
	}
})