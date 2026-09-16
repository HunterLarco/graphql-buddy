#!/usr/bin/env node

import * as commander from '@commander-js/extra-typings';
import * as graphql from 'graphql';

import * as api from '../api';
import * as commands from './commands';

const main = () => {
  process.setUncaughtExceptionCaptureCallback((error) => {
    // Capturing the exception suppresses Node's default non-zero exit, so we
    // must set it ourselves. This is critical for build systems, which key off
    // the exit code to decide whether validation passed.
    process.exitCode = 1;

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

    // Operation validation may surface several GraphQLErrors at once. Print each
    // with the same rich source context as the single-error case above.
    if (error instanceof api.OperationValidationError) {
      for (const nested of error.errors) {
        console.error(nested.toString());
      }
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
