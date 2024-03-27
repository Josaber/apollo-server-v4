import { BookApi } from "./BookApi";

export interface Context {
  token: string;
  dataSources: {
    bookApi: BookApi;
  };
}

export type Book = {
  id: string;
}
