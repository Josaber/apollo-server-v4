import { PubSub } from 'graphql-subscriptions'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis from 'ioredis'
import { isLocalEnv } from './utils.js'
import { settings } from '../settings/index.js'

// TODO: production should use redis cluster
export const pubsub = isLocalEnv()
  ? new PubSub()
  : new RedisPubSub({
    publisher: new Redis(settings.redis),
    subscriber: new Redis(settings.redis)
  })
