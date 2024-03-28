import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';
import { Logger } from "winston"

export class BaseDataSource extends RESTDataSource {
  override baseURL = 'http://localhost:5000/';
  override logger: Logger;
  protected token?: string;

  constructor(logger: Logger, token?: string) {
    super();
    this.logger = logger;
    this.token = token;
  }

  protected override requestDeduplicationPolicyFor() {
    return { policy: 'do-not-deduplicate' } as const;
  }

  override willSendRequest(path: string, request: AugmentedRequest) {
    this.logger.info(JSON.stringify({ method: request.method, path }))
    if (this.token) {
      request.headers['authorization'] = this.token;
    }
  }
}
