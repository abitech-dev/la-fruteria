import pg from 'pg';
import { createClient } from 'redis';
import { crearAlmacen } from './almacen.js';
import { crearCola } from './cola.js';

export async function conectar(config, registrar) {
  const pool = new pg.Pool(config.baseDeDatos);
  pool.on('error', (error) => registrar('error', 'conexión con PostgreSQL', { motivo: error.message }));
  const redis = createClient({ url: config.redisUrl });
  redis.on('error', (error) => registrar('error', 'conexión con Redis', { motivo: error.message }));
  await redis.connect();
  return {
    almacen: crearAlmacen(pool),
    cola: crearCola(redis),
    cerrar: () => Promise.allSettled([pool.end(), redis.close()]),
  };
}
