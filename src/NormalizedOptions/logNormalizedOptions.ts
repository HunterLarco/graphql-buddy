import chalk from 'chalk';

import * as logging from '../logging';
import * as normalizedOptions from './NormalizedOptions';

export const logNormalizedOptions = (options: normalizedOptions.NormalizedOptions): void => {
  const { input, output } = options;

  /// Input.

  console.log(`${logging.formatLabel(`Input`)}`);

  console.log(`  - ${logging.formatIterableLabel(`Schema`, input.schema.length)}`);
  for (const schemaFile of input.schema) {
    console.log(`    - ${logging.formatFile(schemaFile)}`);
  }

  console.log(`  - ${logging.formatIterableLabel(`Path Aliases`, input.pathAliases.size)}`);
  for (const [alias, source] of input.pathAliases.entries()) {
    console.log(`    - ${logging.formatFile(alias)} → ${logging.formatFile(source)}`);
  }

  /// Output.

  console.log(`${logging.formatLabel(`Output`)}`);

  console.log(`  - ${logging.formatLabel(`Bundle`)} ${logging.formatFile(output.bundle)}`);

  console.log(`  - ${logging.formatLabel(`Validation Stamp`)} ${logging.formatFile(output.validationStamp)}`);
};
