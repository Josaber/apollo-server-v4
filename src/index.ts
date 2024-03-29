import { createServer } from 'http'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import express from 'express'
import cors from 'cors'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { ApolloServerPluginCacheControlDisabled, ApolloServerPluginLandingPageDisabled, ApolloServerPluginSchemaReportingDisabled, ApolloServerPluginUsageReportingDisabled } from '@apollo/server/plugin/disabled'
import { Context } from './graphql/book/types.js'
import { formatError, getDynamicContext, getToken } from './utils.js'
import { isProductionEnv } from './common/utils.js'
import { BookApi } from './graphql/book/BookApi.js'
import { AuthorApi } from './graphql/book/AuthorApi.js'
import logger from './common/logger.js'
import { schema } from './graphql/index.js'
import { PORT } from './common/constants.js'

const app = express()
const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
})

const serverCleanup = useServer({
  schema,
  onConnect: async () => {
    logger.debug('Connected!')
  },
  onDisconnect () {
    logger.debug('Disconnected!')
  },
  context: async (ctx) => {
    return getDynamicContext(ctx)
  }
}, wsServer)

const server = new ApolloServer<Context>({
  schema,
  formatError,
  includeStacktraceInErrorResponses: !isProductionEnv(),
  introspection: !isProductionEnv(),
  logger,
  plugins: [
    ApolloServerPluginUsageReportingDisabled(),
    ApolloServerPluginSchemaReportingDisabled(),
    ApolloServerPluginCacheControlDisabled(),
    isProductionEnv()
      ? ApolloServerPluginLandingPageDisabled()
      // ApolloServerPluginLandingPageProductionDefault()
      : ApolloServerPluginLandingPageLocalDefault({ embed: true, footer: false }),
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart () {
        return {
          async drainServer () {
            await serverCleanup.dispose()
          }
        }
      }
    }
  ]
})

await server.start()
app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server, {
  context: async ({ req }) => {
    const token = await getToken(req.headers.authorization)
    return {
      token,
      dataSources: {
        bookApi: new BookApi(logger, token),
        authorApi: new AuthorApi(logger, token)
      }
    }
  }
}))

app.get('/liveness', (_, res) => {
  res.status(200).json({ status: 'UP' })
})

httpServer.listen(PORT, () => {
  logger.info(`🚀  Server ready at: http://localhost:${PORT}/graphql`)
})
