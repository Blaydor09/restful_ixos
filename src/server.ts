import { app } from './app';
import { env } from './config/env';
import { closePool, pool } from './db/pool';

async function start() {
  await pool.query('SELECT 1');

  const server = app.listen(env.PORT, () => {
    console.log(`Mood Music API escuchando en el puerto ${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('No se pudo iniciar la API:', error);
  process.exit(1);
});
