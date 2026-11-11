import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createClient } from 'redis';
import { GenericContainer } from 'testcontainers';
import { crearCola } from '../../src/cola.js';

const IMAGEN = 'redis:8-alpine@sha256:3811787313eba226a2ef38658c6ccb91cd5e110edc89c37767de373120a0e5a0';

describe('cola contra un Redis real', () => {
  let contenedor;
  let cliente;
  let cola;

  before(async () => {
    contenedor = await new GenericContainer(IMAGEN).withExposedPorts(6379).start();
    cliente = createClient({ url: `redis://${contenedor.getHost()}:${contenedor.getMappedPort(6379)}` });
    await cliente.connect();
    cola = crearCola(cliente);
  });

  after(async () => {
    await cliente?.close();
    await contenedor?.stop();
  });

  it('le pasa al despachador el código de cada pedido', async () => {
    await cola.encolarDespacho('PRUE-BA01');
    assert.equal(await cola.tomarDespacho(1), 'PRUE-BA01');
  });

  it('guarda el catálogo y lo devuelve igual', async () => {
    const productos = [{ codigo: 'ARA-500', precio_centimos: 2200 }];
    await cola.guardarCatalogo(productos);
    assert.deepEqual(await cola.leerCatalogo(), productos);
  });
});
