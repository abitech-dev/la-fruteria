import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { crearAlmacen } from '../src/almacen.js';

const PRODUCTOS = [
  { codigo: 'ARA-500', nombre: 'Arándanos frescos', precio_centimos: 2200 },
  { codigo: 'PAL-HAS', nombre: 'Palta Hass', precio_centimos: 990 },
];

async function prepararArchivos() {
  const carpeta = await mkdtemp(join(tmpdir(), 'almacen-'));
  const catalogo = join(carpeta, 'productos.json');
  await writeFile(catalogo, JSON.stringify(PRODUCTOS));
  return { catalogo, pedidos: join(carpeta, 'datos', 'pedidos.json') };
}

const pedido = (codigo) => ({ codigo, cliente: 'Mirella', ciudad: 'Lima', lineas: [], total_centimos: 2200 });

describe('almacén en archivo', () => {
  it('lee el catálogo y los precios de los códigos que existen', async () => {
    const almacen = await crearAlmacen(await prepararArchivos());
    assert.deepEqual(await almacen.listarProductos(), PRODUCTOS);
    assert.deepEqual(await almacen.preciosDe(['ARA-500', 'MAN-001']), new Map([['ARA-500', 2200]]));
  });

  it('busca un pedido guardado, sin el nombre del cliente', async () => {
    const almacen = await crearAlmacen(await prepararArchivos());
    await almacen.guardarPedido(pedido('ABCD-2345'));
    const encontrado = await almacen.buscarPedido('ABCD-2345');
    assert.equal(encontrado.estado, 'recibido');
    assert.equal(encontrado.total_centimos, 2200);
    assert.equal(encontrado.cliente, undefined);
    assert.equal(await almacen.buscarPedido('ZZZZ-9999'), null);
  });

  it('conserva los pedidos cuando la API vuelve a arrancar', async () => {
    const archivos = await prepararArchivos();
    await (await crearAlmacen(archivos)).guardarPedido(pedido('ABCD-2345'));
    const otraVez = await crearAlmacen(archivos);
    assert.ok(await otraVez.buscarPedido('ABCD-2345'));
  });

  it('guarda los dos pedidos que llegan a la vez', async () => {
    const almacen = await crearAlmacen(await prepararArchivos());
    await Promise.all([almacen.guardarPedido(pedido('AAAA-2222')), almacen.guardarPedido(pedido('BBBB-3333'))]);
    assert.ok(await almacen.buscarPedido('AAAA-2222'));
    assert.ok(await almacen.buscarPedido('BBBB-3333'));
  });
});
