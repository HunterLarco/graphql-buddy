import * as commander from '@commander-js/extra-typings';

import * as cliOptions from './CliOptions';

export type Program = (options: cliOptions.CliOptions) => Promise<void> | void;

export const runCli = (program: Program): void => {
  const command = new commander.Command();

  command
    .name(`graphql-buddy`)
    .description(`CLI tools for manipulating graphql // designed for build system tooling.`)
    .argument(`<schema...>`, `Input GraphQL schema files to merge`)
    .option(
      `-b, --base <directory>`,
      `Base directory from which paths are resolved.`,
    )
    .option(
      `-a, --alias <pattern...>`,
      `Path alias options for @graphql-tools/load.`,
    )
    .option(
      `--write-merged <file>`,
      `Merges the inputs into a single schema file.`,
    )
    .option(
      `--write-validation <file>`,
      `Creates a validation stamp to confirm valid GraphQL schema.`,
    )
    .option(`-s, --silent`, `Only log critical information.`, false)
    .action((schema, options) =>
      program({
        schema,
        ...options,
      }),
    );

  command.parse();
};
