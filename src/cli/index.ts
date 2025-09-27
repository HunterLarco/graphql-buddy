import * as commander from '@commander-js/extra-typings';
import * as graphql from 'graphql';

import * as commands from './commands';

const main = () => {
  process.setUncaughtExceptionCaptureCallback((error) => {
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
      return;
    }

    console.error(error);
  });

  commander.program
    .name(`graphql-buddy`)
    .description(
      `CLI tools for manipulating graphql // designed for build system tooling.`,
    )
    .addCommand(commands.createBundleCommand())
    .addCommand(commands.createValidateCommand())
    .parse();
};

main();
