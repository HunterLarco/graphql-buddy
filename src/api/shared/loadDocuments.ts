import * as nodeFs from 'node:fs/promises';

import * as graphqlFileLoader from '@graphql-tools/graphql-file-loader';
import * as graphqlLoad from '@graphql-tools/load';

import type * as graphqlUtils from '@graphql-tools/utils';

import * as graphqlFilesModule from './GraphqlFiles';

/**
 * Loads GraphQL operation documents (queries, mutations, subscriptions, and
 * fragments) from disk.
 *
 * Each file is returned as an independent document. `#import` statements are
 * resolved by @graphql-tools/graphql-file-loader, so a document that imports a
 * fragment from another file comes back self-contained.
 */
export const loadDocuments = async (
  graphqlFiles: graphqlFilesModule.GraphqlFiles,
): Promise<Array<graphqlUtils.Source>> => {
  const { files, pathAliases } =
    await graphqlFilesModule.normalizeGraphqlFiles(graphqlFiles);

  // Like `loadSchema`, we manually verify inputs exist because the file loader
  // silently skips missing files and we want to inform clients when expected
  // inputs are absent.
  for (const file of files) {
    try {
      await nodeFs.access(file, nodeFs.constants.F_OK);
    } catch {
      throw new Error(`File does not exist: ${file}`);
    }
  }

  return await graphqlLoad.loadDocuments(files, {
    loaders: [new graphqlFileLoader.GraphQLFileLoader()],
    pathAliases: {
      mappings: Object.fromEntries(pathAliases.entries()),
    },
  });
};
