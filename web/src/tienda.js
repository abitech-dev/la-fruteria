import { computed, reactive } from 'vue';

export const CIUDADES = ['Lima', 'Arequipa', 'Trujillo'];
export const CANTIDAD_MAXIMA = 99;

const formatoDeSoles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const formatoDeFecha = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });

export const soles = (centimos) => formatoDeSoles.format(centimos / 100);
export const fecha = (iso) => formatoDeFecha.format(new Date(iso));
export const nombreCompleto = (producto) => `${producto.nombre} (${producto.unidad})`;

export function familiaDe(codigo) {
  if (codigo.startsWith('ARA')) return 'arandanos';
  if (codigo.startsWith('MIX')) return 'cajas';
  return 'paltas';
}

export const tienda = reactive({
  productos: [],
  carrito: new Map(),
  isCatalogoConError: false,
  envio: null,
});

const buscarProducto = (codigo) => tienda.productos.find((producto) => producto.codigo === codigo);

export const lineas = computed(() =>
  [...tienda.carrito]
    .map(([codigo, cantidad]) => ({ producto: buscarProducto(codigo), cantidad }))
    .filter((linea) => linea.producto),
);
export const unidades = computed(() => lineas.value.reduce((suma, linea) => suma + linea.cantidad, 0));
export const totalCentimos = computed(() =>
  lineas.value.reduce((suma, linea) => suma + linea.producto.precio_centimos * linea.cantidad, 0),
);

export const cantidadDe = (codigo) => tienda.carrito.get(codigo) ?? 0;

export function cambiarCantidad(codigo, diferencia) {
  const cantidad = Math.min(Math.max(cantidadDe(codigo) + diferencia, 0), CANTIDAD_MAXIMA);
  if (cantidad === 0) tienda.carrito.delete(codigo);
  else tienda.carrito.set(codigo, cantidad);
}

export async function cargarCatalogo() {
  tienda.isCatalogoConError = false;
  try {
    const respuesta = await fetch('/api/productos');
    if (!respuesta.ok) throw new Error(respuesta.statusText);
    tienda.productos = await respuesta.json();
  } catch {
    tienda.isCatalogoConError = true;
  }
}

export async function enviarPedido({ cliente, ciudad }) {
  tienda.envio = { estado: 'enviando' };
  try {
    const respuesta = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cliente,
        ciudad,
        lineas: [...tienda.carrito].map(([producto, cantidad]) => ({ producto, cantidad })),
      }),
    });
    const cuerpo = await respuesta.json().catch(() => ({}));
    if (respuesta.status === 201) {
      tienda.carrito.clear();
      tienda.envio = { estado: 'recibido', pedido: cuerpo };
      return;
    }
    const errores = cuerpo.errores ?? {};
    tienda.envio = { estado: 'rechazado', errores, mensaje: mensajeDeRechazo(respuesta.status, errores) };
  } catch {
    tienda.envio = {
      estado: 'rechazado',
      errores: {},
      mensaje: 'Sin conexión con la tienda. Revisa tu internet y vuelve a intentarlo.',
    };
  }
}

function mensajeDeRechazo(estado, errores) {
  if (estado === 422) {
    return Object.entries(errores)
      .filter(([campo]) => campo !== 'cliente')
      .map(([, mensaje]) => mensaje)
      .join(' ');
  }
  if (estado === 429) return 'Hiciste varios pedidos seguidos. Espera un minuto y vuelve a intentarlo.';
  return 'No pudimos registrar el pedido. Vuelve a intentarlo en un momento.';
}
