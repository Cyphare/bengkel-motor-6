import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';

let server: http.Server;

const startServer = async () => {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      console.log(`[server] ${env.APP_NAME} listening on port ${env.PORT} (${env.NODE_ENV})`);
      console.log(`[server] Health check: http://localhost:${env.PORT}/api/health`);
    });

    const handleShutdown = async (signal: string) => {
      console.log(`[server] Received ${signal}, shutting down gracefully...`);

      if (server) {
        server.close(async () => {
          await disconnectDatabase();
          console.log('[server] Closed HTTP server and database connection.');
          process.exit(0);
        });

        setTimeout(() => {
          console.error('[server] Shutdown timed out. Forcing exit.');
          process.exit(1);
        }, 10000);
      } else {
        await disconnectDatabase();
        process.exit(0);
      }
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    process.on('unhandledRejection', (reason: any) => {
      console.error('[server] Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('[server] Uncaught Exception:', error);
    });
  } catch (error) {
    console.error('[server] Failed to start:', error);
    process.exit(1);
  }
};

startServer();
