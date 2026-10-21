import pg from 'pg';
import { crearAlmacen } from './almacen.js';
import { crearApp } from './app.js';
import { leerConfig } from './config.js';
import { registrar } from './registro.js';

const config = leerConfig();
const pool = new pg.Pool(config.baseDeDatos);
pool.on('error', (error) => registrar('error', 'conexión con PostgreSQL', { motivo: error.message }));

const servidor = crearApp({ almacen: crearAlmacen(pool), registrar }).listen(config.puerto, () => {
  registrar('info', 'API escuchando', { puerto: config.puerto });
});

// Ante SIGTERM se terminan las solicitudes en curso y luego se cierra.
for (const senal of ['SIGTERM', 'SIGINT']) {
  process.once(senal, () => {
    registrar('info', 'cerrando la API', { senal });
    servidor.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}
