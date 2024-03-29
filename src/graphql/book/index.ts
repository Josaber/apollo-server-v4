import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { fileURLToPath } from 'url'
import { resolvers } from './resolvers.js'
import { Module } from '../types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const typeDefs = readFileSync(resolve(__dirname, 'schema.gql'), 'utf8')

export const bookModule: Module = {
  typeDefs,
  resolvers
}
