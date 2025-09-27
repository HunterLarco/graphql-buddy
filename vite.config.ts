import * as vite from 'vitest/config';

export default vite.defineConfig({
  test: {
    server: {
      deps: {
        // Required for graphql compatability.
        //
        // See https://github.com/vitejs/vite/issues/7879
        fallbackCJS: true,
      },
    },
  },
});
