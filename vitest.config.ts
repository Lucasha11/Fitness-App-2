import { defineConfig } from 'vitest/config';

/**
 * Kept separate from `vite.config.ts` deliberately.
 *
 * The suite covers logic, never rendering (see the testing policy in
 * CLAUDE.md), so it needs neither the React plugin nor a DOM. Running in plain
 * Node is what keeps the whole suite fast enough to leave in watch mode while
 * you work — which is the only way a test suite actually gets used.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
