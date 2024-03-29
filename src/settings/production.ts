import { Settings } from './types'

export const production: Settings = {
  env: 'production',
  apiHost: 'http://localhost:5000/',
  redis: {
    host: 'localhost',
    port: 6379,
    password: '123456'
  }
}
