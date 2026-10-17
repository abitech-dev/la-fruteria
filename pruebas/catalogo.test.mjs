import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const leer = async (ruta) => JSON.parse(await readFile(new URL(ruta, import.meta.url), 'utf8'));

// La vitrina usa su propia copia hasta que pueda hablar con la API.
test('la vitrina y la API ofrecen el mismo catálogo', async () => {
  assert.deepEqual(await leer('../web/public/productos.json'), await leer('../api/productos.json'));
});
