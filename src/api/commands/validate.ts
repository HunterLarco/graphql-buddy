import * as stringifyObject from 'stringify-object';

import * as shared from '../shared';

export type ValidateOptions = {
  schema: shared.LoadSchemaOptions;
};

/**
 * Validates that the provided GraphQL schema contain valid syntax and have no
 * unknown symbols.
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

  await shared.loadSchema(normalizedSchemaOptions);

  return createValidationStamp({
    ...options,
    schema: normalizedSchemaOptions,
  });
};

const createValidationStamp = (
  options: Omit<ValidateOptions, `schema`> & {
    schema: shared.NormalizedLoadSchemaOptions;
  },
): string =>
  stringifyObject.default(
    { options, outcome: { valid: true } },
    {
      indent: `  `,
      filter: (container, property) =>
        !(container === options.schema && property === `normalized`),
    },
  );
