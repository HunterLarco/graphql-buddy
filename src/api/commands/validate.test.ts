import * as nodePath from 'node:path';

import { describe, expect, it } from 'vitest';

import * as validate from './validate';

const schemaFixture = (name: string) => ({
  files: [`**/*.graphql`],
  base: nodePath.resolve(__dirname, `../../../test_fixtures/schema/${name}`),
});

/**
 * Each documents fixture is self-contained: `<case>/schema` holds the schema
 * the documents are validated against and `<case>/documents` holds the
 * operations and fragments under test.
 */
const documentsFixture = (
  name: string,
  options: { pathAliases?: Map<string, string> } = {},
) => {
  const base = nodePath.resolve(
    __dirname,
    `../../../test_fixtures/documents/${name}`,
  );
  return {
    schema: {
      files: [`**/*.graphql`],
      base: nodePath.join(base, `schema`),
    },
    operations: {
      files: [`*.graphql`],
      base: nodePath.join(base, `documents`),
      pathAliases: options.pathAliases,
    },
  };
};

describe(`validate`, () => {
  describe(`schema`, () => {
    it(`creates a validation stamp when validation passes.`, async () => {
      await expect(
        validate.validate({ schema: schemaFixture(`multiple_files`) }),
      ).resolves.toStrictEqual(expect.any(String));
    });

    it(`throws for invalid schema.`, async () => {
      await expect(
        validate.validate({ schema: schemaFixture(`missing_scalar`) }),
      ).rejects.toThrowError(`Unknown type "DateTime"`);
    });
  });

  describe(`documents`, () => {
    it(`validates operations against the schema, resolving imported fragments.`, async () => {
      await expect(
        validate.validate(documentsFixture(`imported_fragment`)),
      ).resolves.toStrictEqual(expect.any(String));
    });

    it(`resolves nested #import chains.`, async () => {
      await expect(
        validate.validate(documentsFixture(`nested_imports`)),
      ).resolves.toStrictEqual(expect.any(String));
    });

    it(`resolves #import paths through path aliases.`, async () => {
      await expect(
        validate.validate(
          documentsFixture(`aliased_import`, {
            pathAliases: new Map([[`@fragments/*`, `fragments/*`]]),
          }),
        ),
      ).resolves.toStrictEqual(expect.any(String));
    });

    it(`allows fragment-only files that nothing imports.`, async () => {
      await expect(
        validate.validate(documentsFixture(`fragment_library`)),
      ).resolves.toStrictEqual(expect.any(String));
    });

    it(`throws for operations when the schema has no matching root type.`, async () => {
      await expect(
        validate.validate(documentsFixture(`missing_root_type`)),
      ).rejects.toThrowError(`Schema does not define a query root type.`);
    });

    it(`still validates field selections inside fragment-only files.`, async () => {
      await expect(
        validate.validate(documentsFixture(`invalid_fragment`)),
      ).rejects.toThrowError(`Cannot query field "thisFieldDoesNotExist"`);
    });

    it(`throws for operations that reference unknown fields.`, async () => {
      await expect(
        validate.validate(documentsFixture(`unknown_field`)),
      ).rejects.toThrowError(`Cannot query field "thisFieldDoesNotExist"`);
    });

    it(`throws for operations files that contain type-system definitions.`, async () => {
      await expect(
        validate.validate(documentsFixture(`mixed_sdl`)),
      ).rejects.toThrowError(`The "Bogus" definition is not executable.`);
    });

    it(`throws for #import of a file that does not exist.`, async () => {
      await expect(
        validate.validate(documentsFixture(`broken_import`)),
      ).rejects.toThrowError(`Cannot find module './DoesNotExist.graphql'`);
    });

    it(`throws for unused variables.`, async () => {
      await expect(
        validate.validate(documentsFixture(`unused_variable`)),
      ).rejects.toThrowError(`Variable "$id" is never used`);
    });

    it(`throws for missing required arguments.`, async () => {
      await expect(
        validate.validate(documentsFixture(`missing_argument`)),
      ).rejects.toThrowError(
        `Field "foo" argument "id" of type "ID!" is required`,
      );
    });

    it(`throws for anonymous operations that share a document with named ones.`, async () => {
      await expect(
        validate.validate(documentsFixture(`anonymous_operation`)),
      ).rejects.toThrowError(
        `This anonymous operation must be the only defined operation.`,
      );
    });

    // Documents are validated one file at a time, so an operation name reused
    // across files is not detected. This pins that (documented) behavior.
    it(`allows duplicate operation names across separate files.`, async () => {
      await expect(
        validate.validate(documentsFixture(`duplicate_names`)),
      ).resolves.toStrictEqual(expect.any(String));
    });
  });
});
