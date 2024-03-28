import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { Context } from './graphql/book/types.js';
import { formatError, getDynamicContext, getToken, isProductionEnv } from './graphql/utils.js';
import { BookApi } from './graphql/book/BookApi.js';
import { AuthorApi } from './graphql/book/AuthorApi.js';
import logger from './logger.js';
import { schema } from './graphql/index.js';

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({
  schema,
  onConnect: async () => {
    console.log('Connected!');
  },
  onDisconnect() {
    console.log('Disconnected!');
  },
  context: async (ctx) => {
    return getDynamicContext(ctx);
  },
}, wsServer);

const server = new ApolloServer<Context>({
  schema,
  formatError,
  includeStacktraceInErrorResponses: !isProductionEnv(),
  plugins: [
    isProductionEnv()
      ? ApolloServerPluginLandingPageDisabled()
      // ApolloServerPluginLandingPageProductionDefault()
      : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
})

await server.start();
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
}));

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀  Server ready at: http://localhost:${PORT}/graphql`);
});
