import * as nodeFs from 'node:fs/promises';
import * as nodePath from 'node:path';

import * as graphqlFileLoader from '@graphql-tools/graphql-file-loader';
import * as graphqlLoad from '@graphql-tools/load';
import * as glob from 'glob';

import type * as graphql from 'graphql';

export type LoadSchemaOptions = {
  normalized?: false | null;

  // Relative paths will be resolved using `base`.
  //
  // Also accepts glob patterns.
  files: Array<string>;

  // Directory from which `files` are resolved.
  //
  // Defaults to `process.cwd()`.
  base?: string | null;

  // See @graphql-tools/import#PathAliases
  //
  // Note that relative paths will be resolved relative to `base` to maintain
  // parity with `files`.
  pathAliases?: Map<string, string> | null;
};

export const loadSchema = async (
  options: LoadSchemaOptions | NormalizedLoadSchemaOptions,
): Promise<graphql.GraphQLSchema> => {
  const { files, pathAliases } = options.normalized
    ? options
    : await normalizeLoadSchemaOptions(options);

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

export type NormalizedLoadSchemaOptions = {
  normalized: true;

  // Absolute paths.
  files: Array<string>;

  // See @graphql-tools/import#PathAliases
  pathAliases: Map<string, string>;
};

export const normalizeLoadSchemaOptions = async (
  options: LoadSchemaOptions,
): Promise<NormalizedLoadSchemaOptions> => {
  const base = options.base ?? process.cwd();
  const files = await glob.glob(
    options.files.map((file) => nodePath.resolve(base, file)),
  );

  const pathAliases = new Map<string, string>();
  if (options.pathAliases != null) {
    for (const [alias, source] of options.pathAliases.entries()) {
      pathAliases.set(alias, nodePath.resolve(base, source));
    }
  }

  return {
    normalized: true,
    files,
    pathAliases,
  };
};
