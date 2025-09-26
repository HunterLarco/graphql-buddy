import * as tsup from 'tsup';

export default tsup.defineConfig({
  entry: {
    api: 'src/api/index.ts',
    cli: 'src/cli/index.ts',
  },

  format: 'esm',
  clean: true,
  dts: true,
  platform: 'node',
  sourcemap: true,
});
