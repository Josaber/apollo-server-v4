import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import cors from 'cors';
import { GraphQLError, GraphQLFormattedError, GraphQLScalarType, Kind } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import { unwrapResolverError } from '@apollo/server/errors';
import { PubSub } from 'graphql-subscriptions';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime()
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object')
  },
  parseValue(value) {
    if (typeof value === 'number') {
      return new Date(value)
    }
    throw new Error('GraphQL Date Scalar parser expected a `number`')
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10))
    }
    return null
  }
})

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  scalar Date
  scalar JSON

  enum Language {
    ZH
    EN
  }

  type Author {
    name: String!
    books: [Book!]!
  }

  interface Book {
    title: String!
    author: Author!
    publishedAt: Date!
    metadata: JSON! @deprecated(reason: "Hard to resolve json string")
  }

  type Novel implements Book {
    title: String!
    author: Author!
    publishedAt: Date!
    metadata: JSON!
    language: Language!
  }

  type Comic implements Book {
    title: String!
    author: Author!
    publishedAt: Date!
    metadata: JSON!
    color: Boolean!
  }

  union SearchBookResult = Novel | Comic | Author

  type Query {
    book(id: String!): Book
    books: [Book!]!
    privateBooks: [Book!]!
    search(contains: String!): [SearchBookResult!]
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type UpdateBookMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    book: Book
  }

  type Mutation {
    updateBookAuthor(id: String!, author: String!): UpdateBookMutationResponse!
  }

  type BookUpdateEvent {
    book: Book
    success: Boolean!
  }

  type Subscription {
    bookUpdated: BookUpdateEvent!
  }
`

interface Context {
  token: string;
  dataSources: unknown;
}

let books = [
  {
    id: 'book-1',
    title: 'The Awakening',
    author: {
      name: 'Kate Chopin'
    },
    publishedAt: new Date(),
    metadata: { price: 123 },
    language: 'zh'
  },
  {
    id: 'book-2',
    title: 'City of Glass',
    author: {
      name: 'Paul Auster'
    },
    publishedAt: new Date(),
    metadata: { price: 123 },
    color: true
  }
]

const pubsub = new PubSub();
const resolvers = {
  Query: {
    book: (_, { id }: { id: string }) => books.find(it => it.id === id),
    books: () => books,
    privateBooks: (_, __, contextValue: Context) => {
      if (!contextValue.token) {
        throw new GraphQLError('Unauthorized!', {
          extensions: {
            code: 'Unauthorized',
            http: { status: 401 }
          }
        })
      }
      return books
    },
    search: (_, { contains }: { contains: string }) => books.filter(it => it.title.includes(contains) || it.author.name.includes(contains))
  },
  Language: {
    ZH: 'zh',
    EN: 'en'
  },
  Date: dateScalar,
  JSON: GraphQLJSON,
  Author: {
    books: (parent) => books.filter(it => it.author.name === parent.name)
  },
  Book: {
    __resolveType(book) {
      if (book.color) {
        return 'Comic'
      }
      if (book.language) {
        return 'Novel'
      }
      return null
    }
  },
  SearchBookResult: {
    __resolveType(obj) {
      if (obj.name) {
        return 'Author'
      }
      if (obj.color === true || obj.color === false) {
        return 'Comic'
      }
      if (obj.language) {
        return 'Novel'
      }
      return null
    }
  },
  Mutation: {
    updateBookAuthor: (_, { id, author }: { id: string; author: string }) => {
      const book = books.find(book => book.id === id)
      if (book) {
        books = [...books.filter(book => book.id !== id), { ...book, author: { ...book.author, name: author } }]
        pubsub.publish('BOOK_UPDATED', {
          bookUpdated: {
            success: true,
            book
          },
        });
        return {
          code: '200',
          success: true,
          message: "Successfully update book author",
          book
        }
      }
      pubsub.publish('BOOK_UPDATED', {
        bookUpdated: {
          success: false,
          book
        },
      });
      return {
        code: '404',
        success: false,
        message: `Not found book ${id}`,
        book
      }
    }
  },
  Subscription: {
    bookUpdated: {
      subscribe: () => pubsub.asyncIterator(['BOOK_UPDATED'])
    }
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/subscriptions',
});

const getDynamicContext = async (ctx) => {
  if (ctx.connectionParams.authorization) {
    const token = await getToken(ctx.connectionParams.authorization);
    return { token };
  }
  return { token: null };
};

const serverCleanup = useServer({
  schema,
  onConnect: async () => {
    console.log('Connected!');
  },
  onDisconnect() {
    console.log('Disconnected!');
  },
  context: async (ctx) => {
    return getDynamicContext(ctx);
  },
}, wsServer);

const server = new ApolloServer<Context>({
  schema,
  formatError: (formattedError: GraphQLFormattedError, error: unknown) => {
    const unwrappedError = unwrapResolverError(error)
    if (unwrappedError instanceof Error) {
      return { message: `Internal Server Error with ${unwrappedError.message}` }
    }
    if (error instanceof Error) {
      return { message: `Internal Server Error with ${error.message}` }
    }
    return formattedError
  },
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  plugins: [
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      // ApolloServerPluginLandingPageProductionDefault()
      : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
})

const getToken = (authorization?: string): string => {
  return authorization?.toString() ?? ''
}

await server.start();
app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server, {
  context: async ({ req }) => {
    /*
    if(!req.headers.authorization) {
      throw new GraphQLError('Unauthorized!', {
        extensions: {
          code: 'Unauthorized',
          http: { status: 401 }
        }
      })
    }
    */
    return {
      token: await getToken(req.headers.authorization),
      dataSources: {}
    }
  }
}));

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀  Server ready at: http://localhost:${PORT}/graphql`);
});
