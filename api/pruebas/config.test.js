import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { leerConfig } from '../src/config.js';

describe('leerConfig', () => {
  it('lee la clave de la base de datos desde un archivo, como un secreto', () => {
    const archivo = join(mkdtempSync(join(tmpdir(), 'fruteria-')), 'bd_clave');
    writeFileSync(archivo, 'clave-del-archivo\n');
    const config = leerConfig({ BD_CLAVE_ARCHIVO: archivo, BD_CLAVE: 'clave-de-variable' });
    assert.equal(config.baseDeDatos.password, 'clave-del-archivo');
  });

  it('acepta la clave en una variable cuando no hay archivo', () => {
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
