import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 3000, // 可选：指定端口
    open: true, // 可选：启动时自动打开浏览器
  }
})
