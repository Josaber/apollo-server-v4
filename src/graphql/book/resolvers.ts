import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { Author, Book, Context, UpdateBookRequest } from "./types";
import { BOOK_UPDATED_TOPIC } from "../../common/constants.js";

const getBook = async (_: unknown, { id }: { id: string }, contextValue: Context): Promise<Book> => {
  const book = await contextValue.dataSources.bookApi.getBook(id)
  return {
    ...book,
    author: { ...book.author, id: book.authorId }
  }
}

const getBooks = async (_: unknown, __: unknown, contextValue: Context): Promise<Book[]> => await contextValue.dataSources.bookApi.getBooks()

const getPrivateBooks = async (_: unknown, __: unknown, contextValue: Context): Promise<Book[]> => {
  if (!contextValue.token) {
    throw new GraphQLError('Unauthorized!', {
      extensions: {
        code: 'Unauthorized',
        http: { status: 401 }
      }
    })
  }
  return await contextValue.dataSources.bookApi.getBooks()
}

const search = async (_: unknown, { contains }: { contains: string }, contextValue: Context): Promise<(Book | Author)[]> => {
  const books = await contextValue.dataSources.bookApi.getBooks()
  const authors = await contextValue.dataSources.authorApi.getAuthors()
  return [...books.filter(it => it.title.includes(contains)), ...authors.filter(it => it.name.includes(contains))]
}

const getAuthorName = async (parent: Author, _: unknown, contextValue: Context): Promise<string> => {
  return (await contextValue.dataSources.authorApi.getAuthor(parent.id)).name
}

const getAuthorBooks = async (parent: Author, _: unknown, contextValue: Context): Promise<Book[]> => {
  return await contextValue.dataSources.bookApi.getBooks(parent.id)
}

const updateBookAuthor = async (_: unknown, { id, updateBookRequest }: { id: string; updateBookRequest: UpdateBookRequest }, contextValue: Context) => {
  const book = await contextValue.dataSources.bookApi.updateBook(id, updateBookRequest)
  pubsub.publish(BOOK_UPDATED_TOPIC, {
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

const resolveBookType = (book: Book) => {
  if (book.color === true || book.color === false) {
    return 'Comic'
  }
  if (book.language) {
    return 'Novel'
  }
  return null
}

const resolveBookAndAuthorType = (obj: Book & Author) => {
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

const pubsub = new PubSub();
export const resolvers = {
  Query: {
    book: getBook,
    books: getBooks,
    privateBooks: getPrivateBooks,
    search
  },
  Language: {
    ZH: 'zh',
    EN: 'en'
  },
  Author: {
    name: getAuthorName,
    books: getAuthorBooks
  },
  Book: {
    __resolveType: resolveBookType,
  },
  SearchBookResult: {
    __resolveType: resolveBookAndAuthorType
  },
  Mutation: {
    updateBookAuthor
  },
  Subscription: {
    bookUpdated: {
      subscribe: () => pubsub.asyncIterator([BOOK_UPDATED_TOPIC])
    }
  }
}
