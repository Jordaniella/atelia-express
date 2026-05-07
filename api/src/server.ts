import { createApp } from './app.js';
import { env } from './config/env.js';
import { disconnectPrisma } from './config/prisma.js';

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`AtelIA API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received. Closing HTTP server and database connection...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
