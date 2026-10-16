import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cambiarCantidad,
  cantidadDe,
  cargarCatalogo,
  enviarPedido,
  tienda,
  totalCentimos,
  unidades,
} from './tienda.js';

const PRODUCTOS = [
  { codigo: 'ARA-500', nombre: 'Arándanos frescos', unidad: 'caja de 500 g', precio_centimos: 2200 },
  { codigo: 'PAL-HAS', nombre: 'Palta Hass', unidad: 'kilo', precio_centimos: 990 },
];

const responder = (estado, cuerpo) =>
  vi.fn(async () => new Response(JSON.stringify(cuerpo), { status: estado }));

beforeEach(() => {
  tienda.productos = PRODUCTOS;
  tienda.carrito.clear();
  tienda.envio = null;
  tienda.isCatalogoConError = false;
  vi.unstubAllGlobals();
});

describe('carrito', () => {
  it('suma y resta cantidades, y quita el producto al llegar a cero', () => {
    cambiarCantidad('ARA-500', 1);
    cambiarCantidad('ARA-500', 1);
    expect(cantidadDe('ARA-500')).toBe(2);
    cambiarCantidad('ARA-500', -2);
    expect(tienda.carrito.has('ARA-500')).toBe(false);
  });

  it('no pasa de 99 unidades por producto', () => {
    cambiarCantidad('PAL-HAS', 120);
    expect(cantidadDe('PAL-HAS')).toBe(99);
  });

  it('calcula unidades y total en céntimos', () => {
    cambiarCantidad('ARA-500', 2);
    cambiarCantidad('PAL-HAS', 1);
    expect(unidades.value).toBe(3);
    expect(totalCentimos.value).toBe(5390);
  });
});

describe('catálogo', () => {
  it('marca el error si la API falla y lo limpia al reintentar', async () => {
    vi.stubGlobal('fetch', responder(503, {}));
    await cargarCatalogo();
    expect(tienda.isCatalogoConError).toBe(true);

    vi.stubGlobal('fetch', responder(200, PRODUCTOS));
    await cargarCatalogo();
    expect(tienda.isCatalogoConError).toBe(false);
    expect(tienda.productos).toHaveLength(2);
  });
});

describe('enviar el pedido', () => {
  it('con éxito, vacía el carrito y guarda el ticket', async () => {
    cambiarCantidad('ARA-500', 1);
    vi.stubGlobal('fetch', responder(201, { codigo: 'ABCD-2345', total_centimos: 2200 }));
    await enviarPedido({ cliente: 'Mirella', ciudad: 'Trujillo' });
    expect(tienda.carrito.size).toBe(0);
    expect(tienda.envio).toEqual({ estado: 'recibido', pedido: { codigo: 'ABCD-2345', total_centimos: 2200 } });
  });

  it('con datos inválidos, conserva el carrito y guarda los errores', async () => {
    cambiarCantidad('ARA-500', 1);
    vi.stubGlobal('fetch', responder(422, { errores: { cliente: 'Escribe un nombre.' } }));
    await enviarPedido({ cliente: '', ciudad: 'Trujillo' });
    expect(tienda.carrito.size).toBe(1);
    expect(tienda.envio.errores.cliente).toBe('Escribe un nombre.');
  });

  it('ante muchos pedidos seguidos, pide esperar', async () => {
    cambiarCantidad('ARA-500', 1);
    vi.stubGlobal('fetch', responder(429, {}));
    await enviarPedido({ cliente: 'Mirella', ciudad: 'Lima' });
    expect(tienda.envio.mensaje).toMatch(/Espera un minuto/);
  });
});
