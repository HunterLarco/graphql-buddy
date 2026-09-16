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
 * type definitions they select from, which need not include any root
 * operation type, and none of the specified validation rules actually depend
 * on one when checking fragments. So we drive the same rules with the same
 * public machinery (`ValidationContext`, `TypeInfo`, `visitInParallel`) and
 * simply skip the schema assertion. Schema validity is the schema loader's
 * responsibility, not this function's.
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

  // Operations, unlike fragments, genuinely require a root type to validate
  // against. Without this check the rules would still run but report every
  // top-level field as unknown, which obscures the real problem.
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
  if (errors.length > 0) {
    return errors;
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
