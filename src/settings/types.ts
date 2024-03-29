type Environment = 'local' | 'test' | 'production'

type RedisConfig = {
  host: string;
  port: number;
  password: string;
}

export type Settings = {
  env: Environment;
  apiHost: string;
  redis: RedisConfig;
}
