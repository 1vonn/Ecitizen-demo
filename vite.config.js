import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const DEFAULT_SUPABASE_URL = 'https://apeczjxewxaplosktkuz.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZWN6anhld3hhcGxvc2t0a3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNjA1ODksImV4cCI6MjEwNzgzNjU4OX0.LTxitV_KGm1qnTFlnGHMolgMZutIhP88YlWMXcMGVWA'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL ||
          env.NEXT_PUBLIC_SUPABASE_URL ||
          env.SUPABASE_URL ||
          DEFAULT_SUPABASE_URL
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY ||
          env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          env.SUPABASE_ANON_KEY ||
          DEFAULT_SUPABASE_ANON_KEY
      ),
    },
  }
})
