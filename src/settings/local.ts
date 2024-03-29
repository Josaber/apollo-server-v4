import { Settings } from './types'

export const local: Settings = {
  env: 'local',
  apiHost: 'http://localhost:5000/',
  redis: {
    host: 'localhost',
    port: 6379,
    password: '123456'
  }
}
