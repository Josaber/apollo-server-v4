import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';
import { Author } from './types';

export class AuthorApi extends RESTDataSource {
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

  async getAuthors(): Promise<Author[]> {
    return this.get<Author[]>('authors');
  }

  async getAuthor(id: string): Promise<Author> {
    return this.get<Author>(`authors/${encodeURIComponent(id)}`);
  }
}
