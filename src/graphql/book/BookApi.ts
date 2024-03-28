import { Book, UpdateBookRequest } from './types';
import { BaseDataSource } from '../BaseDataSource.js';
import { Logger } from "winston"

export class BookApi extends BaseDataSource {
  constructor(logger: Logger, token?: string) {
    super(logger, token);
  }

  async getBooks(authorId?: string): Promise<Book[]> {
    return this.get<Book[]>('books', {
      params: {
        authorId,
      },
    });
  }

  async getBook(id: string): Promise<Book> {
    return this.get<Book>(`books/${encodeURIComponent(id)}`);
  }

  async updateBook(id: string, updateBookRequest: UpdateBookRequest): Promise<Book> {
    const book = this.get<Book>(`books/${encodeURIComponent(id)}`);
    this.patch(`books/${encodeURIComponent(id)}`, {
      body: updateBookRequest
    });
    return book
  }
}
