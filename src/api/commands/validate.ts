import * as stringifyObject from 'stringify-object';

import * as shared from '../shared';

export type ValidateOptions = {
  schema: shared.LoadSchemaOptions;
};

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

export const createValidationStamp = (
  options: Omit<ValidateOptions, `schema`> & {
    schema: shared.NormalizedLoadSchemaOptions;
  },
): string =>
  stringifyObject.default(
    { options, outcome: { valid: true } },
    {
      filter: (container, property) =>
        !(container === options.schema && property === `normalized`),
    },
  );
