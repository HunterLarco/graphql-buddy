import * as graphqlToolsUtils from '@graphql-tools/utils';
import * as graphql from 'graphql';

import * as shared from '../shared';

export type BundleOptions = {
  schema: shared.LoadSchemaOptions;

  // Defaults to true.
  shake?: boolean | null;
};

export const bundle = async (options: BundleOptions): Promise<string> => {
  const shake = options.shake ?? true;

  let schema = await shared.loadSchema(options.schema);
  if (shake) {
    schema = graphqlToolsUtils.pruneSchema(schema);
  }

  return graphql.printSchema(schema);
};
