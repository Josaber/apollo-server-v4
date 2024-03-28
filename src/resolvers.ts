import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { Author, Book, Context, UpdateBookRequest } from "./types";
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

const pubsub = new PubSub();
export const resolvers = {
  Query: {
    book: async (_: unknown, { id }: { id: string }, contextValue: Context): Promise<Book> => {
      const book = await contextValue.dataSources.bookApi.getBook(id)
      return {
        ...book,
        author: { ...book.author, id: book.authorId }
      }
    },
    books: async (_: unknown, __: unknown, contextValue: Context): Promise<Book[]> => await contextValue.dataSources.bookApi.getBooks(),
    privateBooks: async (_: unknown, __: unknown, contextValue: Context): Promise<Book[]> => {
      if (!contextValue.token) {
        throw new GraphQLError('Unauthorized!', {
          extensions: {
            code: 'Unauthorized',
            http: { status: 401 }
          }
        })
      }
      return await contextValue.dataSources.bookApi.getBooks()
    },
    search: async (_: unknown, { contains }: { contains: string }, contextValue: Context): Promise<Book[]> => {
      const books = await contextValue.dataSources.bookApi.getBooks()
      // TODO: author search
      return books.filter(it => it.title.includes(contains))
    }
  },
  Language: {
    ZH: 'zh',
    EN: 'en'
  },
  Date: dateScalar,
  JSON: GraphQLJSON,
  Author: {
    name: async (parent: Author, _: unknown, contextValue: Context): Promise<string> => {
      return (await contextValue.dataSources.authorApi.getAuthor(parent.id)).name
    },
    books: async (parent: Author, _: unknown, contextValue: Context): Promise<Book[]> => {
      return await contextValue.dataSources.bookApi.getBooks(parent.id)
    }
  },
  Book: {
    __resolveType(book: Book) {
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
    __resolveType(obj: Book & Author) {
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
    updateBookAuthor: async (_: unknown, { id, updateBookRequest }: { id: string; updateBookRequest: UpdateBookRequest }, contextValue: Context) => {
      const book = await contextValue.dataSources.bookApi.updateBook(id, updateBookRequest)
      pubsub.publish('BOOK_UPDATED', {
        bookUpdated: {
          success: true,
          book
        },
      });
      return {
        code: '200',
        success: true,
        message: `Successfully updated book ${id}`,
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
