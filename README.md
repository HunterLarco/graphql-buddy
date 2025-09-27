[![npm version](https://badge.fury.io/js/graphql-buddy.svg)](https://badge.fury.io/js/graphql-buddy)
[![CI](https://github.com/HunterLarco/graphql-buddy/actions/workflows/ci.yml/badge.svg)](https://github.com/HunterLarco/graphql-buddy/actions/workflows/ci.yml)

> CLI tools for manipulating graphql // designed for build system tooling.

Includes useful tools like:

- `bundle` ~ merge multiple schema's into one (wth tree shaking).
- `validate` ~ validate GraphQL schema.

Necessary for build tool integrations such as [rules_graphql](https://github.com/HunterLarco/rules_graphql)

## Quick Start

```
npm install graphql-buddy

npx graphql-buddy bundle **/*.graphql
```

## Documentation

You can always use `graphql-buddy --help` for CLI documentation.

## Bundle

Bundles multiple schema into a single file _and_ prunes any unused types from
the bundle.

For example:

```sh
npx graphql-buddy bundle **/*.graphql

# If you want to preserve unused types.
npx graphql-buddy bundle **/*.graphql --no-shake
```

## Validate

Validates schema, ensuring valid syntax and that all symbols are found.

For example:

```sh
npx graphql-buddy validate **/*.graphql
```

For many build systems (such as BUCK and BAZEL) all build steps _must_ emit a
file. Validate accomodates this by writing "validation stamps", a file only
written if validation is successful and documents the exact settings used during
validation. For example:

```
npx graphql-buddy validate **/*.graphql --stamp schema.stamp
```

## Contributions

Contributions, issues and feature requests are very welcome. If you are using
this package and fixed a bug for yourself, please consider submitting a PR!
