import * as nodePath from 'node:path';

import { describe, expect, it } from 'vitest';

import * as validate from './validate';

describe(`validate`, () => {
  it(`creates a validation stamp when validation passes.`, async () => {
    await expect(
      validate.validate({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/multiple_files`,
          ),
        },
      }),
    ).resolves.toStrictEqual(expect.any(String));
  });

  it(`throws for invalid schema.`, async () => {
    await expect(
      validate.validate({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/missing_scalar`,
          ),
        },
      }),
    ).rejects.toThrowError(`Unknown type "DateTime"`);
  });

  it(`validates operations against the schema, resolving imported fragments.`, async () => {
    await expect(
      validate.validate({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/multiple_files`,
          ),
        },
        operations: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/operations/valid`,
          ),
        },
      }),
    ).resolves.toStrictEqual(expect.any(String));
  });

  it(`throws for operations that reference unknown fields.`, async () => {
    await expect(
      validate.validate({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/multiple_files`,
          ),
        },
        operations: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/operations/invalid`,
          ),
        },
      }),
    ).rejects.toThrowError(`Cannot query field "thisFieldDoesNotExist"`);
  });
});
