import { Author } from './types'
import { BaseDataSource } from '../BaseDataSource.js'

export class AuthorApi extends BaseDataSource {
  async getAuthors (): Promise<Author[]> {
    return this.get<Author[]>('authors')
  }

  async getAuthor (id: string): Promise<Author> {
    return this.get<Author>(`authors/${encodeURIComponent(id)}`)
  }
}
