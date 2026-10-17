import { reactive } from 'vue';

export const CIUDADES = ['Lima', 'Arequipa', 'Trujillo'];

const formatoDeSoles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

export const soles = (centimos) => formatoDeSoles.format(centimos / 100);

export function familiaDe(codigo) {
  if (codigo.startsWith('ARA')) return 'arandanos';
  if (codigo.startsWith('MIX')) return 'cajas';
  return 'paltas';
}

export const tienda = reactive({
  productos: [],
  isCatalogoConError: false,
});

export async function cargarCatalogo() {
  tienda.isCatalogoConError = false;
  try {
    const respuesta = await fetch('/productos.json');
    if (!respuesta.ok) throw new Error(respuesta.statusText);
    tienda.productos = await respuesta.json();
  } catch {
    tienda.isCatalogoConError = true;
  }
}
