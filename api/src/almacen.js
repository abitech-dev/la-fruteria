import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

// Sin base de datos aún. El archivo vive en la capa escribible de la caja.
export async function crearAlmacen({ catalogo, pedidos }) {
  const productos = JSON.parse(await readFile(catalogo, 'utf8'));
  const precios = new Map(productos.map((producto) => [producto.codigo, producto.precio_centimos]));
  let escritura = Promise.resolve();

  async function leerPedidos() {
    try {
      return JSON.parse(await readFile(pedidos, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async function agregarPedido(pedido) {
    const guardados = await leerPedidos();
    guardados.push(pedido);
    await mkdir(dirname(pedidos), { recursive: true });
    // Renombrar es atómico, así un apagón no deja el archivo a medias.
    await writeFile(`${pedidos}.tmp`, JSON.stringify(guardados, null, 2));
    await rename(`${pedidos}.tmp`, pedidos);
  }

  return {
    async listarProductos() {
      return productos;
    },

    async preciosDe(codigos) {
      return new Map(codigos.filter((codigo) => precios.has(codigo)).map((codigo) => [codigo, precios.get(codigo)]));
    },

    // Una escritura por vez, para que dos pedidos simultáneos no se pisen.
    guardarPedido(pedido) {
      const siguiente = escritura.then(() =>
        agregarPedido({ ...pedido, estado: 'recibido', creado_en: new Date().toISOString() }),
      );
      escritura = siguiente.catch(() => {});
      return siguiente;
    },

    async buscarPedido(codigo) {
      const pedido = (await leerPedidos()).find((guardado) => guardado.codigo === codigo);
      if (!pedido) return null;
      return { codigo, estado: pedido.estado, total_centimos: pedido.total_centimos, creado_en: pedido.creado_en };
    },
  };
}
