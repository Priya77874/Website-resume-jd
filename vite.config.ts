import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Explicitly declare process to prevent TypeScript 'Cannot find name' errors
// when @types/node is not installed (common in frontend-only repos).
declare const process: {
  cwd: () => string;
  env: Record<string, string>;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This polyfills process.env.API_KEY so your existing code works without changes
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "AIzaSyAB-fQNhfpPCdaQ4PREgNvN2CQDF9yIkbE")
    }
  }
})