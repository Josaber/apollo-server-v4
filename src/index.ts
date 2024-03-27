import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';
import { Context } from './types.js';
import { formatError, getDynamicContext, getToken } from './utils.js';

const schema = makeExecutableSchema({ typeDefs, resolvers });
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
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  plugins: [
    process.env.NODE_ENV === 'production'
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
    return {
      token: await getToken(req.headers.authorization),
      dataSources: {}
    }
  }
}));

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀  Server ready at: http://localhost:${PORT}/graphql`);
});
