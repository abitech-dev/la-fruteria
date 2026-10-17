import { randomInt } from 'node:crypto';

export const CIUDADES = ['Lima', 'Arequipa', 'Trujillo'];

const LARGO_MAXIMO_DEL_CLIENTE = 80;
const LINEAS_MAXIMAS = 20;
const CANTIDAD_MAXIMA = 99;

// Sin 0, O, 1, I ni L, que se confunden al dictar el código por teléfono.
const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const FORMATO_DE_CODIGO = /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;

export function validarPedido(cuerpo) {
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return { errores: { pedido: 'El pedido debe ser un objeto JSON.' } };
  }
  const errores = {};
  const cliente = typeof cuerpo.cliente === 'string' ? cuerpo.cliente.trim() : '';
  if (cliente.length === 0 || cliente.length > LARGO_MAXIMO_DEL_CLIENTE) {
    errores.cliente = `Escribe un nombre de 1 a ${LARGO_MAXIMO_DEL_CLIENTE} caracteres.`;
  }
  if (!CIUDADES.includes(cuerpo.ciudad)) {
    errores.ciudad = `Solo despachamos a ${CIUDADES.join(', ')}.`;
  }
  const lineas = Array.isArray(cuerpo.lineas) ? cuerpo.lineas : [];
  const errorDeLineas = validarLineas(lineas);
  if (errorDeLineas) errores.lineas = errorDeLineas;

  if (Object.keys(errores).length > 0) return { errores };
  return {
    pedido: {
      cliente,
      ciudad: cuerpo.ciudad,
      lineas: lineas.map(({ producto, cantidad }) => ({ producto, cantidad })),
    },
  };
}

function validarLineas(lineas) {
  if (lineas.length === 0 || lineas.length > LINEAS_MAXIMAS) {
    return `El pedido lleva de 1 a ${LINEAS_MAXIMAS} productos.`;
  }
  const isLineaValida = (linea) =>
    typeof linea?.producto === 'string' &&
    Number.isInteger(linea.cantidad) &&
    linea.cantidad >= 1 &&
    linea.cantidad <= CANTIDAD_MAXIMA;
  if (!lineas.every(isLineaValida)) {
    return `Cada producto lleva su código y una cantidad entera de 1 a ${CANTIDAD_MAXIMA}.`;
  }
  const productos = new Set(lineas.map((linea) => linea.producto));
  if (productos.size !== lineas.length) {
    return 'Cada producto va una sola vez; suma las cantidades.';
  }
  return null;
}

export function calcularTotal(lineas, precios) {
  return lineas.reduce((total, { producto, cantidad }) => total + cantidad * precios.get(producto), 0);
}

export function generarCodigo() {
  const caracter = () => ALFABETO[randomInt(ALFABETO.length)];
  const bloque = () => Array.from({ length: 4 }, caracter).join('');
  return `${bloque()}-${bloque()}`;
}

export function isCodigoValido(codigo) {
  return typeof codigo === 'string' && FORMATO_DE_CODIGO.test(codigo);
}
