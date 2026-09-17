import * as nodePath from 'node:path';

import { describe, expect, it } from 'vitest';

import * as bundle from './bundle';

describe(`bundle`, () => {
  it(`handles a single file with no extra deps or aliases.`, async () => {
    expect(
      await bundle.bundle({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/schema/single_file`,
          ),
        },
      }),
    ).toStrictEqual(
      `
schema {
  query: Query
}

type Query {
  foo: Foo
  bar: Bar
}

type Foo {
  id: ID!
  displayName: String
}

type Bar {
  id: ID!
  foo: Foo
}
`.trim(),
    );
  });

  it(`handles multiple files with no extra deps or aliases.`, async () => {
    expect(
      await bundle.bundle({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/schema/multiple_files`,
          ),
        },
      }),
    ).toStrictEqual(
      `
schema {
  query: Query
  mutation: Mutation
}

type Bar {
  baz: Baz
}

type Baz {
  dateCreated: DateTime!
}

scalar DateTime

type Foo {
  id: ID!
  name: String
  bar: Bar
}

type Mutation {
  addFoo(foo: FooInput!): Foo!
}

input FooInput {
  name: String
}

type Query {
  allFoo: [Foo!]!
}
`.trim(),
    );
  });

  it(`shakes extra deps from a single file.`, async () => {
    expect(
      await bundle.bundle({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/schema/single_file_with_extra_deps`,
          ),
        },
      }),
    ).toStrictEqual(
      `
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Query {
  foo: Foo
}

type Mutation {
  addFooToBar(displayName: String!): Bar
}

type Subscription {
  foo: FooEvent
}

type Foo {
  id: ID!
  displayName: String
}

type Bar {
  id: ID!
  foo: Foo
}

type FooEvent {
  foo: Foo!
}
`.trim(),
    );
  });

  it(`preserves directive definitions and usages.`, async () => {
    expect(
      await bundle.bundle({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/schema/directives`,
          ),
        },
      }),
    ).toStrictEqual(
      `
schema {
  query: Query
}

directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION

directive @tag(name: String!) repeatable on OBJECT | FIELD_DEFINITION | ENUM

directive @unused on FIELD_DEFINITION

enum Role @tag(name: "enum") {
  ADMIN
  USER
}

type Query {
  foo: Foo
  legacyFoo: Foo @deprecated(reason: "Use \`foo\` instead.")
}

type Foo @auth @tag(name: "first") @tag(name: "second") {
  id: ID!
  displayName: String @auth(requires: USER)
  secret: String @auth(requires: ADMIN) @tag(name: "sensitive")
}
`.trim(),
    );
  });

  it(`throws for invalid schema.`, async () => {
    await expect(
      bundle.bundle({
        schema: {
          files: [`*.graphql`],
          base: nodePath.resolve(
            __dirname,
            `../../../test_fixtures/schema/missing_scalar`,
          ),
        },
      }),
    ).rejects.toThrowError(`Unknown type "DateTime"`);
  });
});
