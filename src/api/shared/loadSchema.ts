import * as nodeFs from 'node:fs/promises';
import * as nodePath from 'node:path';

import * as graphql from 'graphql';
import * as graphqlFileLoader from '@graphql-tools/graphql-file-loader';
import * as graphqlLoad from '@graphql-tools/load';

export type LoadSchemaOptions = {
  // Relative paths will be resolved using `base`.
  files: Array<string>;

  // Directory from which `files` are resolved.
  //
  // Defaults to `process.cwd()`.
  base?: string | null;

  // See @graphql-tools/import#PathAliases
  //
  // Note that relative paths will be resolved relative to `base` to maintain
  // parity with `files`.
  pathAliases: Map<string, string>;
};

export const loadSchema = async (
  options: LoadSchemaOptions,
): Promise<graphql.GraphQLSchema> => {
  const base = options.base ?? process.cwd();
  const files = options.files.map((file) => nodePath.resolve(base, file));

  const pathAliases = new Map<string, string>();
  for (const [alias, source] of options.pathAliases.entries()) {
    pathAliases.set(alias, nodePath.resolve(base, source));
  }

  // @graphql-tools/graphql-file-loader silently skips input files which are not
  // found. I suspect this is so that it can delegate missing inputs to other
  // loaders. For our purposes, this is undesirable because we want to inform
  // clients if expected inputs are missing. For that reason, we manually
  // validate that the files exist first.
  for (const file of files) {
    try {
      await nodeFs.access(file, nodeFs.constants.F_OK);
    } catch {
      throw new Error(`File does not exist: ${file}`);
    }
  }

  return graphqlLoad.loadSchema(files, {
    loaders: [new graphqlFileLoader.GraphQLFileLoader()],
    pathAliases: {
      mappings: Object.fromEntries(pathAliases.entries()),
    },
  });
};
