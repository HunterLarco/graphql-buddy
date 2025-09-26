import * as tsup from 'tsup';

export default tsup.defineConfig({
  entry: {
    api: 'src/api.ts',
    cli: 'src/cli.ts',
  },

  format: 'esm',
  clean: true,
  dts: true,
  platform: 'node',
  sourcemap: true,
})
