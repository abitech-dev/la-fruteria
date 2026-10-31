import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';
import { crearAlmacen } from '../../src/almacen.js';

const IMAGEN = 'postgres:18-alpine@sha256:77f585114c32fbca283dc835b0596f4e52b51b4c6662d7810b2f4084f60a1873';
const ESQUEMA = new URL('../../../base-de-datos/', import.meta.url);

describe('almacén contra un PostgreSQL real', () => {
  let contenedor;
  let pool;
  let almacen;

  before(async () => {
    contenedor = await new PostgreSqlContainer(IMAGEN).start();
    pool = new pg.Pool({ connectionString: contenedor.getConnectionUri() });
    for (const archivo of readdirSync(ESQUEMA).sort()) {
      await pool.query(readFileSync(new URL(archivo, ESQUEMA), 'utf8'));
    }
    almacen = crearAlmacen(pool);
  });

  after(async () => {
    await pool?.end();
    await contenedor?.stop();
  });

  it('lista el catálogo que carga el esquema', async () => {
    const productos = await almacen.listarProductos();
    assert.equal(productos.length, 6);
    assert.equal(productos[0].codigo, 'ARA-125');
  });

  it('guarda un pedido y lo marca como despachado', async () => {
    const lineas = [{ producto: 'ARA-500', cantidad: 2, precio_centimos: 2200 }];
    await almacen.guardarPedido({ codigo: 'PRUE-BA01', cliente: 'Mirella', ciudad: 'Lima', total_centimos: 4400, lineas });
    assert.equal((await almacen.buscarPedido('PRUE-BA01')).estado, 'recibido');
    await almacen.marcarDespachado('PRUE-BA01');
    assert.equal((await almacen.buscarPedido('PRUE-BA01')).estado, 'despachado');
  });
});
