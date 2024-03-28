import { makeExecutableSchema } from '@graphql-tools/schema';
import { bookModule } from './book/index.js';

export const schema = makeExecutableSchema({ ...bookModule });
