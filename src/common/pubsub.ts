import { PubSub } from 'graphql-subscriptions'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis from 'ioredis'
import { isLocalEnv } from './utils'

const option = {
  host: 'localhost',
  port: 6379,
  password: '123456'
}

// TODO: production should use redis cluster
export const pubsub = isLocalEnv()
  ? new PubSub()
  : new RedisPubSub({
    publisher: new Redis(option),
    subscriber: new Redis(option)
  })
