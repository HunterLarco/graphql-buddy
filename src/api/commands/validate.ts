import * as stringifyObject from 'stringify-object';

import * as shared from '../shared';

export type ValidateOptions = {
  schema: shared.GraphqlFiles;

  // Optional GraphQL operation documents (queries, mutations, subscriptions,
  // and fragments) to validate against the loaded schema. When omitted, only
  // the schema itself is validated.
  operations?: shared.GraphqlFiles | null;
};

/**
 * Validates that the provided GraphQL schema contain valid syntax and have no
 * unknown symbols. When operations are provided, additionally validates that
 * every operation is valid against that schema.
 *
 * @param options - Validate options.
 *
 * @returns If validation is successful, returns a validation stamp: a text blob
 *   describing the successful outcome and options used during validation. This
 *   is often useful in build systems where a build step *must* emit a file. If
 *   validation fails, a runtime error will be thrown.
 */
export const validate = async (options: ValidateOptions): Promise<string> => {
  // We manually normalize the `LoadSchemaOptions` so that we can write the most
  // accurate data in our validation stamp. For example, normalization expands
  // globs and resolves absolute paths. These are critical steps to ensure the
  // validation stamp describes without ambiguity which schema were loaded.
  const normalizedSchemaOptions = await shared.normalizeGraphqlFiles(
    options.schema,
  );

  const schema = await shared.loadSchema(normalizedSchemaOptions);

  if (options.operations == null) {
    return createValidationStamp({ schema: normalizedSchemaOptions });
  }

  const normalizedOperationsOptions = await shared.normalizeGraphqlFiles(
    options.operations,
  );
  shared.validateDocuments({
    schema,
    documents: await shared.loadDocuments(normalizedOperationsOptions),
  });

  return createValidationStamp({
    schema: normalizedSchemaOptions,
    operations: normalizedOperationsOptions,
  });
};

const createValidationStamp = (options: {
  schema: shared.NormalizedGraphqlFiles;
  operations?: shared.NormalizedGraphqlFiles;
}): string =>
  stringifyObject.default(
    {
      options: {
        schema: options.schema,
        operations: options.operations,
      },
      outcome: { valid: true },
    },
    {
      indent: `  `,
      filter: (container, property) =>
        !(container === options.schema && property === `normalized`) &&
        !(container === options.operations && property === `normalized`),
    },
  );
