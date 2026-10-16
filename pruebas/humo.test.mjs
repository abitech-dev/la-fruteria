import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { setTimeout as esperar } from 'node:timers/promises';

const TIENDA = process.env.URL_DE_LA_TIENDA ?? 'http://127.0.0.1:8080';

const pedir = (ruta, opciones) => fetch(TIENDA + ruta, opciones);
const enviar = (cuerpo) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(cuerpo),
});
const pedidoPara = (ciudad) => ({ cliente: 'Prueba de humo', ciudad, lineas: [{ producto: 'ARA-125', cantidad: 1 }] });

describe('La Frutería en marcha', () => {
  it('sirve la vitrina con las cabeceras de seguridad y sin versión de nginx', async () => {
    const respuesta = await pedir('/');
    assert.equal(respuesta.status, 200);
    assert.match(await respuesta.text(), /La Frutería/);
    assert.match(respuesta.headers.get('content-security-policy'), /default-src 'self'/);
    assert.equal(respuesta.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(respuesta.headers.get('server'), 'nginx');
  });

  it('comprime el CSS y el JS', async () => {
    const html = await (await pedir('/')).text();
    const recursos = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((recurso) => recurso[1]);
    assert.equal(recursos.length, 2);
    for (const ruta of recursos) {
      const respuesta = await pedir(ruta, { headers: { 'accept-encoding': 'gzip' } });
      assert.equal(respuesta.headers.get('content-encoding'), 'gzip', ruta);
    }
  });

  it('las tres fuentes pesan menos de 80 KB en total', async () => {
    let total = 0;
    for (const fuente of ['plantilla', 'texto', 'codigo']) {
      const respuesta = await pedir(`/fuentes/${fuente}.woff2`, { method: 'HEAD' });
      total += Number(respuesta.headers.get('content-length'));
    }
    assert.ok(total < 80 * 1024, `Pesan ${total} bytes.`);
  });

  it('muestra el catálogo desde PostgreSQL', async () => {
    const productos = await (await pedir('/api/productos')).json();
    assert.equal(productos.length, 6);
  });

  it('rechaza un pedido inválido con 422', async () => {
    assert.equal((await pedir('/api/pedidos', enviar({ cliente: '', lineas: [] }))).status, 422);
  });

  it('el despachador marca el pedido como despachado', async () => {
    const { codigo } = await (await pedir('/api/pedidos', enviar(pedidoPara('Lima')))).json();
    let estado = 'recibido';
    for (let intento = 0; intento < 20 && estado !== 'despachado'; intento += 1) {
      await esperar(1000);
      estado = (await (await pedir(`/api/pedidos/${codigo}`)).json()).estado;
    }
    assert.equal(estado, 'despachado');
  });

  it('no expone las métricas ni la salud de la API hacia afuera', async () => {
    assert.equal((await pedir('/metricas')).status, 404);
    assert.equal((await pedir('/salud/listo')).status, 404);
  });
});
