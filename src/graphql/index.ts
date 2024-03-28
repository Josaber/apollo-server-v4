import { makeExecutableSchema } from '@graphql-tools/schema';
import { bookModule } from './book/index.js';
import { scalarModule } from './scalar/index.js';
import { Module } from './types.js';

const modules: Module[] = [
  bookModule,
  scalarModule
]

const typeDefs = modules.map(module => module.typeDefs).join("\n")
const resolvers = modules.map(module => module.resolvers)

export const schema = makeExecutableSchema({ typeDefs, resolvers });
