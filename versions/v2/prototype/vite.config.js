import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const v3Dependencies = [
  'react',
  'react-dom',
  'react-router-dom',
  'motion',
  'lucide-react',
  'recharts',
  '@radix-ui/react-tabs',
  '@radix-ui/react-tooltip',
]

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: v3Dependencies,
  },
  server: { port: 4173 },
  preview: { port: 4173 },
})
