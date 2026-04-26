import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin"

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [
		tailwindcss(),
		vue(),
		vueDevTools(),
		// Work around Cloudflare plugin HMR crash on some Node/Vite combos.
		...(command === 'serve' ? [] : [cloudflare()]),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		},
	},
}))
