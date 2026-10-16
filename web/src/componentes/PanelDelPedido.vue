<script setup>
import { nextTick, ref } from 'vue';
import { cambiarCantidad, cantidadDe, lineas, nombreCompleto, soles, totalCentimos } from '../tienda.js';
import SelectorDeCantidad from './SelectorDeCantidad.vue';

defineProps({ abierta: { type: Boolean, default: false } });
const emit = defineEmits(['cerrar', 'comprar']);

const panel = ref();
const cierre = ref();

// Si la línea se va, el foco pasa al panel.
async function cambiar(codigo, diferencia) {
  cambiarCantidad(codigo, diferencia);
  await nextTick();
  if (cantidadDe(codigo) === 0) panel.value.focus();
}

defineExpose({
  enfocar: () => {
    panel.value.scrollIntoView({ block: 'start' });
    panel.value.focus();
  },
  enfocarCierre: () => cierre.value.focus(),
});
</script>

<template>
  <aside
    id="pedido"
    ref="panel"
    class="pedido"
    :class="{ abierta }"
    :role="abierta ? 'dialog' : undefined"
    :aria-modal="abierta ? 'true' : undefined"
    aria-labelledby="titulo-pedido"
    tabindex="-1"
  >
    <div class="pedido-cabecera">
      <h2 id="titulo-pedido">Tu pedido</h2>
      <button ref="cierre" type="button" class="cerrar" aria-label="Cerrar tu pedido" @click="emit('cerrar')">×</button>
    </div>

    <p v-if="lineas.length === 0" class="vacio">Tu caja está vacía. Agrega fruta del catálogo.</p>
    <ul v-else id="carrito" class="carrito">
      <li v-for="{ producto, cantidad } in lineas" :key="producto.codigo">
        <span class="linea-imagen">
          <img :src="`/img/${producto.imagen}`" alt="" width="38" height="29">
        </span>
        <span class="linea-nombre">{{ producto.nombre }}</span>
        <span class="linea-detalle">{{ producto.unidad }}</span>
        <span class="linea-subtotal">{{ soles(producto.precio_centimos * cantidad) }}</span>
        <SelectorDeCantidad
          :nombre="nombreCompleto(producto)"
          :cantidad="cantidad"
          @cambiar="(diferencia) => cambiar(producto.codigo, diferencia)"
        />
      </li>
    </ul>

    <p class="total"><span>Total</span> <strong class="plantilla">{{ soles(totalCentimos) }}</strong></p>
    <button
      id="boton-pedir"
      type="button"
      class="boton boton-principal boton-ancho"
      :disabled="lineas.length === 0"
      @click="emit('comprar')"
    >Hacer el pedido<template v-if="totalCentimos > 0"> · {{ soles(totalCentimos) }}</template></button>
  </aside>
</template>
