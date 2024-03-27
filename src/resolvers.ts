import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { Context } from "./types";
import GraphQLJSON from "graphql-type-json";

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
export const resolvers = {
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
    updateBookAuthor: (_, { id, updateBookRequest }: { id: string; updateBookRequest: { title: string; author: string } }) => {
      const book = books.find(book => book.id === id)
      if (book) {
        books = [...books.filter(book => book.id !== id), { ...book, title: updateBookRequest.title ?? book.title, author: { ...book.author, name: updateBookRequest.author ?? book.author.name } }]
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
