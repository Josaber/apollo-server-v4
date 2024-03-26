import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLScalarType, Kind } from 'graphql'
import GraphQLJSON from 'graphql-type-json'

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize (value) {
    if (value instanceof Date) {
      return value.getTime()
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object')
  },
  parseValue (value) {
    if (typeof value === 'number') {
      return new Date(value)
    }
    throw new Error('GraphQL Date Scalar parser expected a `number`')
  },
  parseLiteral (ast) {
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
    description: JSON! @deprecated(reason: "Hard to resolve json string")
  }

  type Novel implements Book {
    title: String!
    author: Author!
    publishedAt: Date!
    description: JSON!
    language: Language!
  }

  type Comic implements Book {
    title: String!
    author: Author!
    publishedAt: Date!
    description: JSON!
    color: Boolean!
  }

  union SearchBookResult = Novel | Comic | Author

  type Query {
    book(id: String!): Book
    books: [Book!]!
    search(contains: String!): [SearchBookResult!]
  }
`

const books = [
  {
    id: 'book-1',
    title: 'The Awakening',
    author: {
      name: 'Kate Chopin'
    },
    publishedAt: new Date(),
    description: { price: 123 },
    language: 'zh'
  },
  {
    id: 'book-2',
    title: 'City of Glass',
    author: {
      name: 'Paul Auster'
    },
    publishedAt: new Date(),
    description: { price: 123 },
    color: true
  }
]

const resolvers = {
  Query: {
    book: (_, { id }) => books.find(it => it.id === id),
    books: () => books,
    search: (_, { contains }) => books.filter(it => it.title.includes(contains) || it.author.name.includes(contains))
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
    __resolveType (book) {
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
    __resolveType (obj) {
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
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 }
})

console.log(`🚀  Server ready at: ${url}`)
