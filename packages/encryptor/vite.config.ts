/// <reference types="vitest" />
import { defineConfig } from 'vite';

import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/encryptor',

  plugins: [
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  build: {
    rollupOptions: {
      input: 'src/lib/__tests__/index.html',
    },
  },

  server: {
    open: 'src/lib/__tests__/index.html',
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    //environment: 'jsdom', // TODO: check this problem with axios
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
