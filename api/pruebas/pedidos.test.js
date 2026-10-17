import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calcularTotal, generarCodigo, isCodigoValido, validarPedido } from '../src/pedidos.js';

const pedidoValido = {
  cliente: '  Mirella  ',
  ciudad: 'Trujillo',
  lineas: [{ producto: 'ARA-500', cantidad: 2 }, { producto: 'PAL-HAS', cantidad: 1 }],
};

describe('validarPedido', () => {
  it('acepta un pedido completo y recorta el nombre del cliente', () => {
    const { pedido, errores } = validarPedido(pedidoValido);
    assert.equal(errores, undefined);
    assert.equal(pedido.cliente, 'Mirella');
    assert.deepEqual(pedido.lineas, pedidoValido.lineas);
  });

  it('ignora los campos que no son del pedido', () => {
    const { pedido } = validarPedido({ ...pedidoValido, estado: 'despachado', total_centimos: 1 });
    assert.deepEqual(Object.keys(pedido).sort(), ['ciudad', 'cliente', 'lineas']);
  });

  it('rechaza un cliente vacío o demasiado largo', () => {
    assert.ok(validarPedido({ ...pedidoValido, cliente: ' ' }).errores.cliente);
    assert.ok(validarPedido({ ...pedidoValido, cliente: 'x'.repeat(81) }).errores.cliente);
  });

  it('solo despacha a Lima, Arequipa y Trujillo', () => {
    assert.ok(validarPedido({ ...pedidoValido, ciudad: 'Cusco' }).errores.ciudad);
  });

  it('rechaza cantidades fuera de 1 a 99 o con decimales', () => {
    for (const cantidad of [0, 100, 1.5, '2']) {
      const lineas = [{ producto: 'ARA-500', cantidad }];
      assert.ok(validarPedido({ ...pedidoValido, lineas }).errores.lineas, `cantidad ${cantidad}`);
    }
  });

  it('rechaza un pedido sin líneas o con un producto repetido', () => {
    assert.ok(validarPedido({ ...pedidoValido, lineas: [] }).errores.lineas);
    const repetido = [{ producto: 'ARA-500', cantidad: 1 }, { producto: 'ARA-500', cantidad: 2 }];
    assert.ok(validarPedido({ ...pedidoValido, lineas: repetido }).errores.lineas);
  });

  it('rechaza un cuerpo que no es un objeto', () => {
    assert.ok(validarPedido(null).errores);
    assert.ok(validarPedido('pedido').errores);
  });
});

describe('calcularTotal', () => {
  it('suma cantidad por precio de cada línea, en céntimos', () => {
    const precios = new Map([['ARA-500', 2200], ['PAL-HAS', 990]]);
    assert.equal(calcularTotal(pedidoValido.lineas, precios), 5390);
  });
});

describe('código de pedido', () => {
  it('se genera con ocho caracteres sin letras ni números ambiguos', () => {
    const codigos = new Set(Array.from({ length: 200 }, generarCodigo));
    assert.equal(codigos.size, 200);
    for (const codigo of codigos) assert.ok(isCodigoValido(codigo), codigo);
  });

  it('rechaza formatos ajenos, como un número correlativo', () => {
    for (const codigo of ['123', 'ABCD-EFG1', 'abcd-efgh', 'ABCD-EFGH-', '../etc']) {
      assert.equal(isCodigoValido(codigo), false, codigo);
    }
  });
});
