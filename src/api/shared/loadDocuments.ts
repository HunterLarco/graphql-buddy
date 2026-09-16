import * as nodeFs from 'node:fs/promises';

import * as graphqlFileLoader from '@graphql-tools/graphql-file-loader';
import * as graphqlLoad from '@graphql-tools/load';

import type * as graphqlUtils from '@graphql-tools/utils';

import * as graphqlFilesModule from './GraphqlFiles';

/**
 * Loads, validates, and parses graphql documents.
 *
 * @param graphqlFiles - Operation or fragment files to process.
 *
 * @returns The parsed GraphQL documents (or throws an error if parsing fails).
 */
export const loadDocuments = async (
  graphqlFiles: graphqlFilesModule.GraphqlFiles,
): Promise<Array<graphqlUtils.Source>> => {
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

  return await graphqlLoad.loadDocuments(files, {
    loaders: [new graphqlFileLoader.GraphQLFileLoader()],
    // By default @graphql-tools/load strips type definitions out of executable
    // documents, so SDL that lands in an operations file (or a schema file
    // caught by an operations glob) would silently vanish. Keeping every
    // definition lets `ExecutableDefinitionsRule` reject it during validation
    // instead.
    filterKinds: [],
    pathAliases: {
      mappings: Object.fromEntries(pathAliases.entries()),
    },
  });
};
