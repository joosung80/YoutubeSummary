import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        '@google-cloud/secret-manager',
        'google-gax',
        '@grpc/grpc-js',
        'google-auth-library',
        'gaxios',
        'node-fetch',
        'fetch-blob',
        'https-proxy-agent',
        'agent-base',
        'jws',
        'jwa',
        'safe-buffer',
        'buffer-equal-constant-time',
        'gcp-metadata',
        'gtoken',
        'retry-request',
        'readable-stream',
        'buffer',
        'stream',
        'util',
        'crypto',
        'fs',
        'path',
        'os',
        'events',
        'http',
        'https',
        'net',
        'tls',
        'dns',
        'zlib',
        'querystring',
        'child_process',
        'assert',
        'url',
        'worker_threads'
      ]
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['@google-cloud/secret-manager']
  }
})
