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

  it('usa los nombres de los servicios de Compose por defecto', () => {
    const config = leerConfig({ BD_CLAVE: 'clave' });
    assert.equal(config.baseDeDatos.host, 'postgres');
    assert.equal(config.redisUrl, 'redis://redis:6379');
    assert.equal(config.puerto, 3000);
  });
});
