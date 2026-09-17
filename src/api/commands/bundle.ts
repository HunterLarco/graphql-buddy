import * as graphqlToolsUtils from '@graphql-tools/utils';
import * as graphql from 'graphql';

import * as shared from '../shared';

export type BundleOptions = {
  schema: shared.GraphqlFiles;

  // Defaults to true.
  shake?: boolean | null;
};

/**
 * Bundles multiple schema together into a single file.
 *
 * @param options - Bundle options.
 *
 * @returns The merged schema as text.
 */
export const bundle = async (options: BundleOptions): Promise<string> => {
  const shake = options.shake ?? true;

  let schema = await shared.loadSchema(options.schema);
  if (shake) {
    schema = graphqlToolsUtils.pruneSchema(schema);
  }

  const printed = graphqlToolsUtils.printSchemaWithDirectives(schema);

  // By default, native graphql directives are not printed in the schema BUT if
  // the user manually defined them we preserve the directive to ensure that the
  // bundle mirror the source.
  const userDefinedBuiltins: Array<string> = [];
  for (const directive of schema.getDirectives()) {
    if (graphql.isSpecifiedDirective(directive) && directive.astNode != null) {
      userDefinedBuiltins.push(graphql.print(directive.astNode));
    }
  }

  return [printed, ...userDefinedBuiltins].join(`\n\n`);
};
