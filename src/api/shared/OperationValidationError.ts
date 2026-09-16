import type * as graphql from 'graphql';

/**
 * Thrown when one or more operation documents fail validation against the
 * schema. Carries every underlying GraphQLError so callers can render each with
 * its full source context.
 */
export class OperationValidationError extends Error {
  readonly errors: ReadonlyArray<graphql.GraphQLError>;

  constructor(errors: ReadonlyArray<graphql.GraphQLError>) {
    super(
      [
        `Operation validation failed with ${errors.length} error(s):`,
        ...errors.map((error) => error.message),
      ].join(`\n`),
    );
    this.name = `OperationValidationError`;
    this.errors = errors;
  }
}
