import * as graphql from 'graphql';
import * as stringifyObject from 'stringify-object';

import * as shared from '../shared';

export type ValidateOptions = {
  schema: shared.LoadSchemaOptions;

  // Optional GraphQL operation documents (queries, mutations, subscriptions,
  // and fragments) to validate against the loaded schema. When omitted, only
  // the schema itself is validated.
  operations?: shared.LoadDocumentsOptions | null;
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
  const normalizedSchemaOptions = await shared.normalizeLoadSchemaOptions(
    options.schema,
  );

  const schema = await shared.loadSchema(normalizedSchemaOptions);

  // Operations are normalized for the same stamp-accuracy reasons as the
  // schema above.
  let normalizedOperationsOptions: shared.NormalizedLoadDocumentsOptions | null =
    null;
  if (options.operations != null) {
    normalizedOperationsOptions = await shared.normalizeLoadSchemaOptions(
      options.operations,
    );
    validateOperations(
      schema,
      await shared.loadDocuments(normalizedOperationsOptions),
    );
  }

  return createValidationStamp({
    schema: normalizedSchemaOptions,
    operations: normalizedOperationsOptions,
  });
};

/**
 * Validates each operation document against the schema, throwing if any
 * document contains errors.
 */
const validateOperations = (
  schema: graphql.GraphQLSchema,
  documents: Array<shared.LoadedDocument>,
): void => {
  const errors: Array<graphql.GraphQLError> = [];

  for (const { document } of documents) {
    // Fragment-only documents are fragment "libraries" that operations pull in
    // via `#import`. Validated in isolation they would trip
    // `NoUnusedFragmentsRule`, so we drop that single rule for them. Every
    // other rule — most importantly that each referenced field, argument, and
    // type actually exists — is still enforced.
    const definesOperation = document.definitions.some(
      (definition) => definition.kind === graphql.Kind.OPERATION_DEFINITION,
    );
    const rules = definesOperation
      ? graphql.specifiedRules
      : graphql.specifiedRules.filter(
          (rule) => rule !== graphql.NoUnusedFragmentsRule,
        );

    errors.push(...graphql.validate(schema, document, rules));
  }

  if (errors.length > 0) {
    // Each GraphQLError renders with rich source context (file, line, and the
    // offending symbol) via its `.toString()`; the wrapper preserves them all
    // so the CLI can print every failure with that same context.
    throw new shared.OperationValidationError(errors);
  }
};

const createValidationStamp = (options: {
  schema: shared.NormalizedLoadSchemaOptions;
  operations: shared.NormalizedLoadDocumentsOptions | null;
}): string =>
  stringifyObject.default(
    {
      options: {
        schema: options.schema,
        // Only document operations in the stamp when they were validated, so
        // schema-only stamps are unaffected by this option.
        ...(options.operations != null
          ? { operations: options.operations }
          : {}),
      },
      outcome: { valid: true },
    },
    {
      indent: `  `,
      filter: (container, property) =>
        !(
          (container === options.schema || container === options.operations) &&
          property === `normalized`
        ),
    },
  );
