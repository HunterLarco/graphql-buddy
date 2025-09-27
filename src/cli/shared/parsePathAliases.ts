export type PathAliases = Map<string, string>;

export const parsePathAliases = (
  encodedAliases: Array<string>,
): PathAliases => {
  const decodedAliases = new Map<string, string>();

  for (const encodedAlias of encodedAliases) {
    const parts = encodedAlias.split(`=`);
    if (parts.length !== 2) {
      throw new Error(
        `Expected an alias in the form "alias=source" but found "${encodedAlias}"`,
      );
    }

    const [alias, source] = parts;
    if (decodedAliases.has(alias)) {
      throw new Error(`Alias "${alias}" is set multiple times.`);
    }

    decodedAliases.set(alias, source);
  }

  return decodedAliases;
};
