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

    const errors = validateDocument(schema, source.document);
    if (errors.length > 0) {
      throw errors[0];
    }
  }
};

/**
 * Validates a single document against the schema.
 *
 * This deliberately does not use `graphql.validate`. That function begins by
 * asserting the *schema* is valid, which among other things requires a query
 * root type. Fragment libraries are frequently validated against only the
 * type definitions they select from.
 *
 * @param schema - The parsed graphql schema.
 * @param document - The document to validate.
 *
 * @returns Any errors found in the document.
 */
const validateDocument = (
  schema: graphql.GraphQLSchema,
  document: graphql.DocumentNode,
): Array<graphql.GraphQLError> => {
  const errors: Array<graphql.GraphQLError> = [];

  const operations = document.definitions.filter(
    (definition): definition is graphql.OperationDefinitionNode =>
      definition.kind === graphql.Kind.OPERATION_DEFINITION,
  );

  // Ensure each operation matches a root GraphQL type. This is not natively
  // checked by the `ValidationContext` because the validation context only
  // inspects operations whose type information is available.
  for (const operation of operations) {
    if (schema.getRootType(operation.operation) == null) {
      errors.push(
        new graphql.GraphQLError(
          `Schema does not define a ${operation.operation} root type.`,
          { nodes: operation },
        ),
      );
    }
  }

  // Fragment-only documents are fragment "libraries" that operations pull in
  // via `#import`. Validated in isolation they would trip
  // `NoUnusedFragmentsRule`, so we drop that single rule for them. Every
  // other rule, most importantly that each referenced field, argument, and
  // type actually exists, are still enforced.
  const rules = graphql.specifiedRules.filter(
    (rule) => operations.length > 0 || rule !== graphql.NoUnusedFragmentsRule,
  );

  const typeInfo = new graphql.TypeInfo(schema);
  const context = new graphql.ValidationContext(
    schema,
    document,
    typeInfo,
    (error) => {
      errors.push(error);
    },
  );
  graphql.visit(
    document,
    graphql.visitWithTypeInfo(
      typeInfo,
      graphql.visitInParallel(rules.map((rule) => rule(context))),
    ),
  );

  return errors;
};
