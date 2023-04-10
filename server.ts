import path from "path";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { json } from "body-parser";
import compression from "compression";
import morgan from "morgan";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { createRequestHandler } from "@remix-run/express";
import { typeDefs, resolvers } from "./server/schema";
import routes from "./server/routes";

const BUILD_DIR = path.join(process.cwd(), "build");

async function main() {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql"
  });

  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer({ schema }, wsServer);
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            }
          };
        }
      }
    ]
  });
  await server.start();

  app.use(compression());

  app.use(routes);

  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token })
    })
  );

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  // Remix fingerprints its assets so we can cache forever.
  app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
  );

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static("public", { maxAge: "1h" }));

  app.use(morgan("tiny"));

  app.all(
    "*",
    process.env.NODE_ENV === "development"
      ? (req, res, next) => {
          purgeRequireCache();

          return createRequestHandler({
            build: require(BUILD_DIR),
            mode: process.env.NODE_ENV
          })(req, res, next);
        }
      : createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV
        })
  );
  const port = process.env.PORT || 3000;

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(`Express server listening on port ${port}`);
  console.log(`🚀 server ready at http://localhost:${port}/graphql`);
}
main();

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
