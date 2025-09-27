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
    .requiredOption(`--out <file>`, `Where to write the bundled schema.`)
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
  silent: boolean;
}): Promise<void> => {
  const { schema, base, alias, silent } = options;
  const out = nodePath.resolve(base ?? process.cwd(), options.out);

  if (!silent) {
    // TODO: log
  }

  await nodeFs.writeFile(
    out,
    await api.bundle({
      schema: {
        files: schema,
        base,
        pathAliases: shared.parsePathAliases(alias ?? []),
      },
    }),
  );

  if (!silent) {
    console.log(`✅ bundler encountered no errors.`);
  }
};
