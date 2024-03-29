import { makeExecutableSchema } from '@graphql-tools/schema';
import { bookModule } from './book/index.js';
import { scalarModule } from './scalar/index.js';
import { Module } from './types.js';
import { fileURLToPath } from 'url';
import path, { resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = readFileSync(resolve(__dirname, "root.gql"), 'utf8')

const modules: Module[] = [
  bookModule,
  scalarModule
]

const typeDefs = root + "\n" + modules.map(module => module.typeDefs).join("\n")
const resolvers = modules.map(module => module.resolvers)

export const schema = makeExecutableSchema({ typeDefs, resolvers });
