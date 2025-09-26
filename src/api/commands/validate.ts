import * as shared from '../shared';

export type ValidateOptions = {
  schema: shared.LoadSchemaOptions;
}

export const validate = async (options: ValidateOptions): Promise<string> => {
  await shared.loadSchema(options.schema);
  return createValidationStamp(options);
}

export const createValidationStamp = (
  options: ValidateOptions
): string => `Validation passed with settings: ` + JSON.stringify({ options }, null, 2);
