import 'dotenv/config';

import { app } from './app.js';
import { env } from './utils/env.js';
import { prisma } from './utils/prisma.js';

const server = app.listen(env.PORT, () => {
  console.log(`API de eventos executando na porta ${env.PORT}.`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
