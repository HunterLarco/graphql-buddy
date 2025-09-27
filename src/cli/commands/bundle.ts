import * as nodeFs from 'node:fs/promises';
import * as nodePath from 'node:path';

import * as commander from '@commander-js/extra-typings';

import * as api from '../../api';
import * as shared from '../shared';

export const createBundleCommand = () =>
  new commander.Command()
    .name(`bundle`)
    .description(`Bundles multiple GraphQL inputs into a single file.`)
    .argument(`<schema...>`, `Input GraphQL schema files to bundle.`)
    .option(
      `-b, --base <directory>`,
      `Base directory from which paths are resolved.`,
    )
    .option(
      `-a, --alias <pattern...>`,
      `Path alias options for @graphql-tools/load.`,
    )
    .option(
      `--out <file>`,
      `Where to write the bundled schema.`,
      `bundle.graphql`,
    )
    .option(`--no-shake`, `Prevents pruning of unused types.`)
    .option(`-s, --silent`, `Only log critical information.`, false)
    .action((schema, options) =>
      bundle({
        schema,
        ...options,
      }),
    );

const bundle = async (options: {
  schema: Array<string>;
  base?: string;
  alias?: Array<string>;
  out: string;
  shake: boolean;
  silent: boolean;
}): Promise<void> => {
  const { schema, base, alias, shake, silent } = options;
  const out = nodePath.resolve(base ?? process.cwd(), options.out);

  await nodeFs.writeFile(
    out,
    await api.bundle({
      schema: {
        files: schema,
        base,
        pathAliases: shared.parsePathAliases(alias ?? []),
      },
      shake,
    }),
  );

  if (!silent) {
    console.log(`✅ bundler encountered no errors.`);
  }
};
