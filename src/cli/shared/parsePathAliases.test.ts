import { describe, expect, it } from 'vitest';

import * as parsePathAliases from './parsePathAliases';

describe(`parsePathAliases`, () => {
  it(`returns empty when no encoded aliases are passed.`, () => {
    expect(parsePathAliases.parsePathAliases([])).toStrictEqual(new Map());
  });

  it(`splits aliases using "=" delimiter.`, () => {
    expect(
      parsePathAliases.parsePathAliases([
        `@/*=src/*`,
        `custom-foo=path/to/foo`,
      ]),
    ).toStrictEqual(
      new Map([
        [`@/*`, `src/*`],
        [`custom-foo`, `path/to/foo`],
      ]),
    );
  });

  it(`throws when aliases conflict.`, () => {
    expect(() =>
      parsePathAliases.parsePathAliases([
        `@/*=src/*`,
        `custom-foo=path/to/foo`,
        `@/*=gen/*`,
      ]),
    ).toThrowError(`Alias "@/*" is set multiple times.`);
  });

  it(`throws when aliases are malformed.`, () => {
    expect(() => parsePathAliases.parsePathAliases([`@/*`])).toThrowError(
      `Expected an alias in the form "alias=source"`,
    );

    expect(() =>
      parsePathAliases.parsePathAliases([`foo=bar=baz`]),
    ).toThrowError(`Expected an alias in the form "alias=source"`);
  });
});
