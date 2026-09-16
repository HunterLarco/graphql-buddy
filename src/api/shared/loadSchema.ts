import * as nodeFs from 'node:fs/promises';

import * as graphqlFileLoader from '@graphql-tools/graphql-file-loader';
import * as graphqlLoad from '@graphql-tools/load';

import type * as graphql from 'graphql';

import * as graphqlFilesModule from './GraphqlFiles';

export const loadSchema = async (
  graphqlFiles: graphqlFilesModule.GraphqlFiles,
): Promise<graphql.GraphQLSchema> => {
  const { files, pathAliases } =
    await graphqlFilesModule.normalizeGraphqlFiles(graphqlFiles);

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
