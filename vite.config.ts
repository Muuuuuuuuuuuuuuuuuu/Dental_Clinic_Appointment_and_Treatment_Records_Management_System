// ==============================================================================
// ไฟล์ตั้งค่า Vite Bundler (vite.config.ts)
// หน้าที่: กำหนดค่าการทำงานของ Vite สำหรับ Development Server และขั้นตอนการ Build เว็บไซต์
// การทำงาน:
//   - plugins: ใช้งาน React Plugin และ Tailwind CSS v4 Plugin
//   - alias: กำหนดตัวย่อ '@' ให้ชี้ไปที่โฟลเดอร์ './src' เพื่อให้ import ไฟล์ได้สะดวก
// ==============================================================================

import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
