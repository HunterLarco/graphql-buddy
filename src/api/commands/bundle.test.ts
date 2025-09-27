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
            `../../../test_fixtures/single_file`,
          ),
        },
      }),
    ).toStrictEqual(
      `
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
            `../../../test_fixtures/multiple_files`,
          ),
        },
      }),
    ).toStrictEqual(
      `
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
            `../../../test_fixtures/single_file_with_extra_deps`,
          ),
        },
      }),
    ).toStrictEqual(
      `
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
});
