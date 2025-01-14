import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/

//if you are working in local -> target : 'http://localhost:3001'
//if you are deploying your aplicattion to the internet : 'https://render-notes-oowh.onrender.com'
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', 
        changeOrigin: true,
      },
    }
  },
})