import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ensures you can access it via IP address
    port: 3001 // Set the port to 3001
  }
  
});