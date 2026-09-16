import * as nodePath from 'node:path';

import * as glob from 'glob';

export type GraphqlFiles = UnsafeGraphqlFiles | NormalizedGraphqlFiles;

export type UnsafeGraphqlFiles = {
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

export type NormalizedGraphqlFiles = {
  normalized: true;

  // Absolute paths.
  files: Array<string>;

  // See @graphql-tools/import#PathAliases
  pathAliases: Map<string, string>;
};

export const normalizeGraphqlFiles = async (
  graphqlFiles: GraphqlFiles,
): Promise<NormalizedGraphqlFiles> => {
  if (graphqlFiles.normalized) {
    return graphqlFiles;
  }

  const base = graphqlFiles.base ?? process.cwd();
  const files = await glob.glob(
    graphqlFiles.files.map((file) => nodePath.resolve(base, file)),
  );

  const pathAliases = new Map<string, string>();
  if (graphqlFiles.pathAliases != null) {
    for (const [alias, source] of graphqlFiles.pathAliases.entries()) {
      pathAliases.set(alias, nodePath.resolve(base, source));
    }
  }

  return {
    normalized: true,
    files,
    pathAliases,
  };
};
