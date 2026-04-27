import { readdir, readFile } from 'fs/promises';
import path from 'path';

import { closePool, pool } from '../db/pool';

async function run() {
  const root = process.cwd();
  const schemaPath = path.join(root, 'database.sql');
  const migrationsPath = path.join(root, 'migrations');

  const files = [schemaPath];
  const migrations = await readdir(migrationsPath);

  for (const migration of migrations.sort()) {
    if (migration.endsWith('.sql')) {
      files.push(path.join(migrationsPath, migration));
    }
  }

  for (const filePath of files) {
    const sql = await readFile(filePath, 'utf8');
    console.log(`Aplicando ${path.basename(filePath)}...`);
    await pool.query(sql);
  }

  console.log('Base de datos inicializada correctamente.');
}

run()
  .catch((error) => {
    console.error('No se pudo inicializar la base de datos:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });

