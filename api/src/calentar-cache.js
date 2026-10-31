import { leerConfig } from './config.js';
import { conectar } from './conexiones.js';
import { registrar } from './registro.js';

// Corre antes que la API, así el primer cliente ya encuentra el catálogo.
const { almacen, cola, cerrar } = await conectar(leerConfig(), registrar);
const productos = await almacen.listarProductos();
await cola.guardarCatalogo(productos);
registrar('info', 'catálogo en la caché', { productos: productos.length });
await cerrar();
