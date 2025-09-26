import * as nodePath from 'node:path';
import * as nodeFs from 'node:fs/promises';

import * as commander from '@commander-js/extra-typings';

import * as shared from '../shared';
import * as api from '../../api';

export const createValidateCommand = () => 
  new commander.Command()
    .name(`validate`)
    .description(`Checks that all provided GraphQL files form a valid schema.`)
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

const validate  = async (options: {
  schema: Array<string>;
  base?: string;
  alias?: Array<string>;
  stamp?: string;
  silent: boolean;
}): Promise<void> => {
  const { schema, base, alias, stamp, silent } = options;

  if (!silent) {
    // TODO: log
  }

  const validationStamp = await api.validate({
    schema: {
      files: schema,
      base,
      pathAliases: shared.parsePathAliases(alias ?? []),
    },
  });

  if (stamp != null) {
    const destination = nodePath.resolve(base ?? process.cwd(), stamp);
    await nodeFs.writeFile(destination, validationStamp);
  }

  if (!silent) {
    console.log(`✅ validation encountered no errors.`)
  }
}
