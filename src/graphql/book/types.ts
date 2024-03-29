import { AuthorApi } from './AuthorApi'
import { BookApi } from './BookApi'

export interface Context {
  token: string;
  dataSources: {
    bookApi: BookApi;
    authorApi: AuthorApi;
  };
}

export type Author = {
  id: string;
  name: string;
}

export type Book = {
  id: string;
  title: string;
  authorId: string;
  author: Author;
  publishedAt: string;
  language?: string;
  color?: boolean;
  metadata: { [key: string]: string };
}

export type UpdateBookRequest = {
  title: string;
  authorId: string;
}
