import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';
import { Book } from './types';

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

  async getBooks(): Promise<Book[]> {
    return this.get<Book[]>('books');
  }

  async getBook(id: string): Promise<Book> {
    return this.get<Book>(`books/${encodeURIComponent(id)}`);
  }
}
