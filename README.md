# graphql-buddy

[![npm version](https://badge.fury.io/js/graphql-buddy.svg)](https://badge.fury.io/js/graphql-buddy)
[![CI](https://github.com/HunterLarco/graphql-buddy/actions/workflows/ci.yml/badge.svg)](https://github.com/HunterLarco/graphql-buddy/actions/workflows/ci.yml)

> CLI tools for manipulating graphql // designed for build system tooling.

Includes useful tools like:

- `bundle` ~ merge multiple schema's into one (wth tree shaking).
- `validate` ~ validate GraphQL schema.

Necessary for build tool integrations such as [rules_graphql].

[rules_graphql]: https://github.com/HunterLarco/rules_graphql

## Table of Contents

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [graphql-buddy](#graphql-buddy)
  - [Quick Start](#quick-start)
  - [Documentation](#documentation)
    - [Bundle](#bundle)
    - [Validate](#validate)
    - [Programmatic Use](#programmatic-use)
  - [Contributions](#contributions)
  <!-- TOC end -->

## Quick Start

```
npm install graphql-buddy

npx graphql-buddy bundle **/*.graphql
```

## Documentation

You can always use `graphql-buddy --help` for CLI documentation.

### Bundle

Bundles multiple schema into a single file _and_ prunes any unused types from
the bundle.

For example:

```sh
npx graphql-buddy bundle **/*.graphql

# If you want to preserve unused types.
npx graphql-buddy bundle **/*.graphql --no-shake
```

### Validate

Validates schema, ensuring valid syntax and that all symbols are found.

For example:

```sh
npx graphql-buddy validate **/*.graphql
```

You can also validate GraphQL operations (queries, mutations, subscriptions,
and fragments) against the schema with `--operations` (`-o`). Each operation is
checked against the schema, ensuring every referenced field, argument, and type
exists.

```sh
npx graphql-buddy validate schema/**/*.graphql --operations 'operations/**/*.graphql'
```

Operations are validated one file at a time. When an operation depends on a
fragment defined elsewhere, pull it in with an `#import` (the same mechanism the
schema loader uses); the imported fragment is resolved before validation:

```graphql
# import "./FooFields.graphql"

query AllFoo {
  allFoo {
    ...FooFields
  }
}
```

For many build systems (such as BUCK and BAZEL) all build steps _must_ emit a
file. Validate accomodates this by writing "validation stamps", a file only
written if validation is successful and documents the exact settings used during
validation. For example:

```
npx graphql-buddy validate **/*.graphql --stamp schema.stamp
```

### Programmatic Use

All commands and most helpers are available programmatically.

```js
import * as graphqlBuddy from 'graphql-buddy';

await graphqlBuddy.bundle({ ... });
await graphqlBuddy.validate({ ... });
```

## Contributions

Contributions, issues and feature requests are very welcome. If you are using
this package and fixed a bug for yourself, please consider submitting a PR!
