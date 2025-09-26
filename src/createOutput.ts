import * as graphql from 'graphql';

import type * as normalizedOptions from './NormalizedOptions';

/**
 * Serializes the provided schema.
 *
 * @param schema - The schema to serialize.
 *
 * @returns Serialized graphql schema.
 */
export const createMergedSchemaOutput = (
  schema: graphql.GraphQLSchema,
): string => graphql.printSchema(schema);

/**
 * Serializes input options to `graphql-parse` as a graphql validation stamp,
 * formalizing a record of the settings used to validate graphql schema.
 *
 * @param options - `graphql-parse` options.
 *
 * @return A validation stamp.
 */
export const createValidationOutput = (
  options: normalizedOptions.InputOptions,
): string => {
  const { schema, pathAliases } = options;

  const content = [`Validation passed with settings:`];

  content.push(`- Schema:`);
  for (const schemaFile of schema) {
    content.push(`  - ${schemaFile}`);
  }

  content.push(`- Path Aliases:`);
  for (const [alias, source] of pathAliases.entries()) {
    content.push(`  - ${alias} → ${source}`);
  }

  return content.join(`\n`);
};
