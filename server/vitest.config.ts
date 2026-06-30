import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    // First run may download the in-memory MongoDB binary.
    testTimeout: 30_000,
    hookTimeout: 120_000,
    // Run suites sequentially so they don't fight over ports/state.
    fileParallelism: false,
    // The preprocessor libraries (typescript, less, pug, stylus…) are heavy
    // CJS packages — let Node require() them directly instead of having Vite
    // try to transform them for import analysis.
    server: {
      deps: {
        external: [/node_modules/],
      },
    },
  },
})
