import * as nodePath from 'node:path';

import * as cliOptions from '../CliOptions';

import * as normalizedOptions from './NormalizedOptions';

export const createNormalizedOptions = (
  options: cliOptions.CliOptions,
): normalizedOptions.NormalizedOptions => {
  const { schema, alias, silent, writeMerged, writeValidation } = options;
  const base = options.base ?? process.cwd();

  return {
    input: {
			schema: normalizeInputFiles({
				base,
				inputFiles: schema,
			}),

			pathAliases: normalizePathAliases({
				base,
				pathAliases: parsePathAliases(alias ?? []),
			}),

			silent,
		},

    output: {
      bundle: normalizeOptionalOutputFile({
        base,
        outputFile: writeMerged,
      }),

      validationStamp: normalizeOptionalOutputFile({
        base,
        outputFile: writeValidation,
      }),
    },
  };
};

const normalizeInputFiles = (options: {
  base: string;
  inputFiles: Array<string>;
}): Array<string> => {
  const { base, inputFiles } = options;

  return inputFiles.map((inputFile) => nodePath.resolve(base, inputFile));
};

const normalizeOptionalOutputFile = (options: {
  base: string;
  outputFile?: string | null;
}): string | null => {
  const { base, outputFile } = options;

  if (outputFile == null) {
    return null;
  }

  return nodePath.resolve(base, outputFile);
};

const normalizePathAliases = (options: {
  base: string;
  pathAliases: Map<string, string>;
}): Map<string, string> => {
  const { base, pathAliases } = options;

  const normalizedPathAliases = new Map<string, string>();
  for (const [alias, source] of pathAliases.entries()) {
    normalizedPathAliases.set(alias, nodePath.resolve(base, source));
  }

  return normalizedPathAliases;
};

const parsePathAliases = (
  encodedAliases: Array<string>,
): Map<string, string> => {
  const decodedAliases = new Map<string, string>();
  for (const encodedAlias of encodedAliases) {
    const parts = encodedAlias.split(`=`);
    if (parts.length !== 2) {
      console.error(
        `Expected an alias in the form "alias=source" but found ${encodedAlias}`,
      );
      process.exit(1);
    }

    const [alias, source] = parts;
    if (decodedAliases.has(alias)) {
      console.error(`Alias ${alias} is set multiple times.`);
      process.exit(1);
    }

    decodedAliases.set(alias, source);
  }

  return decodedAliases;
};
