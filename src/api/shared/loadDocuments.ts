import * as nodeFs from 'node:fs/promises';

import * as graphqlFileLoader from '@graphql-tools/graphql-file-loader';
import * as graphqlLoad from '@graphql-tools/load';

import type * as graphql from 'graphql';

import * as loadSchema from './loadSchema';

// Operation documents are loaded with the same inputs as schema (globs, base
// directory, and path aliases). We alias the types to document intent at call
// sites.
export type LoadDocumentsOptions = loadSchema.LoadSchemaOptions;
export type NormalizedLoadDocumentsOptions =
  loadSchema.NormalizedLoadSchemaOptions;

export type LoadedDocument = {
  // Absolute path of the file the document was loaded from.
  location: string;

  // The parsed document with any `#import`s already resolved and inlined.
  document: graphql.DocumentNode;
};

/**
 * Loads GraphQL operation documents (queries, mutations, subscriptions, and
 * fragments) from disk.
 *
 * Each file is returned as an independent document. `#import` statements are
 * resolved by @graphql-tools/graphql-file-loader, so a document that imports a
 * fragment from another file comes back self-contained.
 */
export const loadDocuments = async (
  options: LoadDocumentsOptions | NormalizedLoadDocumentsOptions,
): Promise<Array<LoadedDocument>> => {
  const { files, pathAliases } = options.normalized
    ? options
    : await loadSchema.normalizeLoadSchemaOptions(options);

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

  const sources = await graphqlLoad.loadDocuments(files, {
    loaders: [new graphqlFileLoader.GraphQLFileLoader()],
    pathAliases: {
      mappings: Object.fromEntries(pathAliases.entries()),
    },
  });

  return sources.map((source) => ({
    location: source.location ?? `<unknown>`,
    document: source.document as graphql.DocumentNode,
  }));
};
