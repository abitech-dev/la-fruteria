import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { leerConfig } from '../src/config.js';

describe('leerConfig', () => {
  it('toma la clave de la base de datos de la variable BD_CLAVE', () => {
    assert.equal(leerConfig({ BD_CLAVE: 'clave' }).baseDeDatos.password, 'clave');
  });

  it('falla al arrancar si no hay clave', () => {
    assert.throws(() => leerConfig({}), /clave de la base de datos/);
  });

  it('busca a PostgreSQL por el nombre de su caja', () => {
    const config = leerConfig({ BD_CLAVE: 'clave' });
    assert.equal(config.baseDeDatos.host, 'postgres');
    assert.equal(config.baseDeDatos.database, 'fruteria');
    assert.equal(config.redisUrl, 'redis://redis:6379');
    assert.equal(config.puerto, 3000);
  });

  it('acepta otra dirección para PostgreSQL', () => {
    const config = leerConfig({ BD_CLAVE: 'clave', BD_HOST: 'host.docker.internal', BD_PUERTO: '5433' });
    assert.equal(config.baseDeDatos.host, 'host.docker.internal');
    assert.equal(config.baseDeDatos.port, 5433);
  });
});
