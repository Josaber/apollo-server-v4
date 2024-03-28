import { Author } from './types';
import { BaseDataSource } from '../BaseDataSource.js';
import { Logger } from "winston"

export class AuthorApi extends BaseDataSource {
  constructor(logger: Logger, token?: string) {
    super(logger, token);
  }

  async getAuthors(): Promise<Author[]> {
    return this.get<Author[]>('authors');
  }

  async getAuthor(id: string): Promise<Author> {
    return this.get<Author>(`authors/${encodeURIComponent(id)}`);
  }
}
