import * as nodeFs from 'node:fs/promises';

import * as graphqlFileLoader from '@graphql-tools/graphql-file-loader';
import * as graphqlLoad from '@graphql-tools/load';
import * as graphql from 'graphql';

import * as createOutput from './createOutput';
import * as normalizedOptions from './NormalizedOptions';

const main = () => {
  normalizedOptions.runCli(graphqlParse);
};

const graphqlParse = async (options: normalizedOptions.NormalizedOptions) => {
  const { input, output } = options;

  /// To remove ambiguity at runtime, we log each option for users.

  if (!input.silent) {
    normalizedOptions.logNormalizedOptions(options);
  }

  // @graphql-tools/graphql-file-loader silently skips input files which are not
  // found. I suspect this is so that it can delegate missing inputs to other
  // loaders. For our purposes, this is undesirable because we want to inform
  // clients if expected inputs are missing. For that reason, we manually
  // validate the inputs first.
  for (const schemaFile of input.schema) {
    try {
      await nodeFs.access(schemaFile, nodeFs.constants.F_OK);
    } catch {
      console.error(`File does not exist: ${schemaFile}`);
      process.exit(1);
    }
  }

  /// Parse the graphql schema.

  const schema = await loadSchema(input);

  /// Write output artifacts.

  if (output.bundle != null) {
    await nodeFs.writeFile(
      output.bundle,
      createOutput.createMergedSchemaOutput(schema),
    );
  }

  if (output.validationStamp != null) {
    await nodeFs.writeFile(
      output.validationStamp,
      createOutput.createValidationOutput(input),
    );
  }

  if (!input.silent) {
    console.log(`✅ graphql-parse encountered no errors.`);
  }
};

const loadSchema = async (options: normalizedOptions.InputOptions): Promise<graphql.GraphQLSchema> => {
  const { schema, pathAliases } = options;

  try {
    return await graphqlLoad.loadSchema(schema, {
      loaders: [new graphqlFileLoader.GraphQLFileLoader()],
      pathAliases: {
        mappings: Object.fromEntries(pathAliases.entries()),
      },
    });
  } catch (error) {
    // When thrown natively, GraphQLError prints like any other error with
    // minimal context, however, when logged with `.toString()` it prints
    // helpful debugging information critical for debugging syntax errors (such
    // as source file, location, symbol, etc...).
    //
    // For example:
    //
    // ```
    // Syntax Error: Expected ":", found Name "ID".
    //
    // src/services/api/schema/CurrentUser.graphql:2:6
    // 1 | type CurrentUser {
    // 2 |   id ID!
    //   |      ^
    // 3 |   dateCreated: DateTime!
    // ```
    //
    // Versus the naive output:
    //
    // ```
    // return new _GraphQLError.GraphQLError(`Syntax Error: ${description}`, {
    // GraphQLError: Syntax Error: Expected ":", found Name "ID".
    //     at syntaxError (node_modules/graphql/error/syntaxError.js:15:10)
    // ```
    if (error instanceof graphql.GraphQLError) {
      console.error(error.toString());
      process.exit(1);
    }

    throw error;
  }
};

main();
