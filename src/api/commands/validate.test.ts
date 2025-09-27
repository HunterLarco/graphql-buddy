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
});
