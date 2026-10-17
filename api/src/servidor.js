import { crearAlmacen } from './almacen.js';
import { crearApp } from './app.js';
import { registrar } from './registro.js';

const PUERTO = 3000;

const almacen = await crearAlmacen({ catalogo: 'productos.json', pedidos: 'datos/pedidos.json' });
const servidor = crearApp({ almacen, registrar }).listen(PUERTO, () => {
  registrar('info', 'API escuchando', { puerto: PUERTO });
});

// Ante SIGTERM se terminan las solicitudes en curso y luego se cierra.
for (const senal of ['SIGTERM', 'SIGINT']) {
  process.once(senal, () => {
    registrar('info', 'cerrando la API', { senal });
    servidor.close(() => process.exit(0));
  });
}
