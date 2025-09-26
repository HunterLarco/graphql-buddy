import * as cliOptions from '../CliOptions';
import * as createNormalizedOptions from './createNormalizedOptions';
import * as normalizedOptions from './NormalizedOptions';

export type Program = (options: normalizedOptions.NormalizedOptions) => Promise<void> | void;

export const runCli = (program: Program): void => cliOptions.runCli(cliOptions => program(createNormalizedOptions.createNormalizedOptions(cliOptions)))
