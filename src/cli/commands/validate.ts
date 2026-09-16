import * as nodeFs from 'node:fs/promises';
import * as nodePath from 'node:path';

import * as commander from '@commander-js/extra-typings';

import * as api from '../../api';
import * as shared from '../shared';

export const createValidateCommand = () =>
  new commander.Command()
    .name(`validate`)
    .description(
      `Checks that all provided GraphQL files form a valid schema, and optionally that operations are valid against it.`,
    )
    .argument(`<schema...>`, `Input GraphQL schema files to validate.`)
    .option(
      `-b, --base <directory>`,
      `Base directory from which paths are resolved.`,
    )
    .option(
      `-a, --alias <pattern...>`,
      `Path alias options for @graphql-tools/load.`,
    )
    .option(
      `-o, --operations <operations...>`,
      `GraphQL operation documents to validate against the schema.`,
    )
    .option(
      `--stamp <file>`,
      `Creates a validation stamp to confirm valid GraphQL schema.`,
    )
    .option(`-s, --silent`, `Only log critical information.`, false)
    .action((schema, options) =>
      validate({
        schema,
        ...options,
      }),
    );

const validate = async (options: {
  schema: Array<string>;
  base?: string;
  alias?: Array<string>;
  operations?: Array<string>;
  stamp?: string;
  silent: boolean;
}): Promise<void> => {
  const { schema, base, alias, operations, stamp, silent } = options;

  const pathAliases = shared.parsePathAliases(alias ?? []);

  const validationStamp = await api.validate({
    schema: {
      files: schema,
      base,
      pathAliases,
    },
    // Operations share the schema's base directory and path aliases.
    operations:
      operations != null ? { files: operations, base, pathAliases } : undefined,
  });

  if (stamp != null) {
    const destination = nodePath.resolve(base ?? process.cwd(), stamp);
    await nodeFs.writeFile(destination, validationStamp);
  }

  if (!silent) {
    console.log(`✅ validation encountered no errors.`);
  }
};
