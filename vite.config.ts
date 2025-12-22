import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Explicitly declare process to prevent TypeScript 'Cannot find name' errors
declare const process: {
  cwd: () => string;
  env: Record<string, string>;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for libs that might expect it to exist
      'process.env': {},
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "AIzaSyAB-fQNhfpPCdaQ4PREgNvN2CQDF9yIkbE")
    }
  }
})