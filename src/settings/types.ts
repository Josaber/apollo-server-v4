type Environment = 'local' | 'test' | 'production'

export type Settings = {
  env: Environment;
  apiHost: string;
}
