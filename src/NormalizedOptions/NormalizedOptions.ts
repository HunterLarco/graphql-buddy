/**
 * `graphql-parse` options derived from the `CliOptions`, but cleaned up. This
 * takes a few forms, for example we convert relative paths to absolute and
 * decode path aliases from compact `//*=src/*` representations into a ES6 Map.
 */
export type NormalizedOptions = {
  input: InputOptions;
  output: OutputOptions;
}

export type InputOptions = {
	// Absolute paths.
	schema: Array<string>;

  // See @graphql-tools/import#PathAliases
	pathAliases: Map<string, string>;

  // When true, only errors are logged.
  silent: boolean;
};

export type OutputOptions = {
  // The absolute path where merged schema will be written (or ignored if
  // unset).
  bundle: string | null;

  // The absolute path where a validation stamp will be written if graphql
  // parsing succeeds (or ignored if unset).
  validationStamp: string | null;
};
