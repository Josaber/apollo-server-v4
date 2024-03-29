import type { IResolvers } from '@graphql-tools/utils'

export type Module = {
  typeDefs: string;
  resolvers: IResolvers;
}
