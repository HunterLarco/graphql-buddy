import * as graphql from 'graphql';

import type * as graphqlUtils from '@graphql-tools/utils';

export type ValidateDocumentsOptions = {
  schema: graphql.GraphQLSchema;
  documents: Array<graphqlUtils.Source>;
};

/**
 * Validates GraphQL documents against their target schema.
 *
 * @param options - Validation options (schema and documents).
 *
 * @throws GraphQLError instances when validation fails.
 */
export const validateDocuments = (options: ValidateDocumentsOptions): void => {
  const { schema, documents } = options;

  for (const source of documents) {
    if (source.document == null) {
      continue;
    }

    // Fragment-only documents are fragment "libraries" that operations pull in
    // via `#import`. Validated in isolation they would trip
    // `NoUnusedFragmentsRule`, so we drop that single rule for them. Every
    // other rule, most importantly that each referenced field, argument, and
    // type actually exists, are still enforced.
    const definesOperation = source.document.definitions.some(
      (definition) => definition.kind === graphql.Kind.OPERATION_DEFINITION,
    );

    const errors = graphql.validate(
      schema,
      source.document,
      graphql.specifiedRules.filter(
        (rule) => definesOperation || rule !== graphql.NoUnusedFragmentsRule,
      ),
    );
    if (errors.length > 0) {
      throw errors[0];
    }
  }
};
