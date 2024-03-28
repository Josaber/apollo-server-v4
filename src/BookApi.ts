import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';
import { Book, UpdateBookRequest } from './types';

export class BookApi extends RESTDataSource {
  override baseURL = 'http://localhost:5000/';
  private token?: string;

  constructor(token?: string) {
    super();
    this.token = token;
  }

  protected override requestDeduplicationPolicyFor() {
    return { policy: 'do-not-deduplicate' } as const;
  }

  override willSendRequest(_path: string, request: AugmentedRequest) {
    if (this.token) {
      request.headers['authorization'] = this.token;
    }
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
    this.put(`books/${encodeURIComponent(id)}`, {
      body: updateBookRequest
    });
    return book
  }
}
