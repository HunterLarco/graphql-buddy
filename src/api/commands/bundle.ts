import * as graphql from 'graphql';

import * as shared from '../shared';

export type BundleOptions = {
  schema: shared.LoadSchemaOptions;
}

export const bundle = async (options: BundleOptions): Promise<string> => 
  graphql.printSchema(await shared.loadSchema(options.schema));
