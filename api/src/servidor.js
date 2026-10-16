import { crearApp } from './app.js';
import { leerConfig } from './config.js';
import { conectar } from './conexiones.js';
import { crearMetricas } from './metricas.js';
import { registrar } from './registro.js';

const config = leerConfig();
const { almacen, cola, cerrar } = await conectar(config, registrar);
const app = crearApp({ almacen, cola, metricas: crearMetricas(), registrar });
const servidor = app.listen(config.puerto, () => {
  registrar('info', 'API escuchando', { puerto: config.puerto });
});

// Ante SIGTERM se terminan las solicitudes en curso y luego se cierra.
for (const senal of ['SIGTERM', 'SIGINT']) {
  process.once(senal, () => {
    registrar('info', 'cerrando la API', { senal });
    servidor.close(async () => {
      await cerrar();
      process.exit(0);
    });
  });
}
