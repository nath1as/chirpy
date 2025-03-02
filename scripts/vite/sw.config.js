import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * @type {import('vite').UserConfig}
 *
 * Service worker
 */
export default defineConfig(({ command }) => {
  const isDev = command === 'serve' || !!process.env.VITE_DEBUG;
  if (isDev) {
    dotenv.config({ path: `.env.local` });
  }

  const define = {
    'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify(process.env.NEXT_PUBLIC_APP_URL),
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  };

  return {
    root: 'public',
    build: {
      lib: {
        entry: path.resolve(__dirname, '../../src/external/sw/index.ts'),
        name: 'sw',
        fileName: () => 'sw.js',
        formats: ['umd'],
      },
      outDir: path.resolve(__dirname, '../../public/'),
      ...(process.env.VITE_DEBUG && {
        minify: false,
        sourcemap: true,
        watch: {},
      }),
    },
    define,
  };
});
