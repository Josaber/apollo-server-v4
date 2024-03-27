export const typeDefs = `#graphql
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

input UpdateBookRequest {
  title: String
  author: String
}

type UpdateBookMutationResponse implements MutationResponse {
  code: String!
  success: Boolean!
  message: String!
  book: Book
}

type Mutation {
  updateBookAuthor(id: String!, updateBookRequest: UpdateBookRequest!): UpdateBookMutationResponse!
}

type BookUpdateEvent {
  book: Book
  success: Boolean!
}

type Subscription {
  bookUpdated: BookUpdateEvent!
}
`
