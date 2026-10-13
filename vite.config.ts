/// <reference types="vitest/config" />
import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3039;

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: { port: PORT, host: true, strictPort: true },
  preview: { port: PORT, host: true },
  build: {
    rollupOptions: {
      output: {
        // Separa as dependencias pesadas de node_modules em vendor chunks estaveis.
        // Antes, tudo caia num unico index-*.js (~807 kB) carregado em toda rota;
        // agrupando por biblioteca, o browser cacheia cada vendor independentemente
        // (um bump de react-query nao invalida o chunk do MUI) e o chunk de entrada
        // encolhe. As paginas ja sao lazy (React.lazy em routes/sections.tsx);
        // isto ataca o compartilhado, nao as rotas.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/[\\/]node_modules[\\/](@mui|@emotion)[\\/]/.test(id)) {
            return 'vendor-mui';
          }
          if (/[\\/]node_modules[\\/](@tanstack|axios)[\\/]/.test(id)) {
            return 'vendor-data';
          }
          if (/[\\/]node_modules[\\/](react-hook-form|@hookform|yup)[\\/]/.test(id)) {
            return 'vendor-forms';
          }
          return 'vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
