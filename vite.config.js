import {
	defineConfig
} from "vite"
import uni from "@dcloudio/vite-plugin-uni";
 
export default defineConfig({
	plugins: [
		uni()
	],
	server: {
		proxy: {
			'/demo-api': {
				"target": "https://www.apisorcery.com/demo-api/", // 大众生产环境
				changeOrigin: true,
				rewrite: path => {
					return path.replace(/^\/demo-api/, '')
				}
			}
		}
	}
})