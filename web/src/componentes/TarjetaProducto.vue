<script setup>
import { computed, nextTick, ref } from 'vue';
import { cambiarCantidad, cantidadDe, familiaDe, nombreCompleto, soles } from '../tienda.js';
import SelectorDeCantidad from './SelectorDeCantidad.vue';

const props = defineProps({ producto: { type: Object, required: true } });

const cantidad = computed(() => cantidadDe(props.producto.codigo));
const agregar = ref();
const selector = ref();

// Al cambiar el «+» por el selector, el foco pasa al botón nuevo.
async function cambiar(diferencia) {
  cambiarCantidad(props.producto.codigo, diferencia);
  await nextTick();
  if (cantidad.value === 0) agregar.value.focus();
  else if (cantidad.value === 1 && diferencia > 0) selector.value.enfocarMas();
}
</script>

<template>
  <li class="producto" :class="familiaDe(producto.codigo)" :data-codigo="producto.codigo">
    <div class="producto-imagen">
      <img :src="`/img/${producto.imagen}`" alt="" width="168" height="126" loading="lazy">
    </div>
    <div class="rotulo">
      <span class="plantilla">{{ producto.codigo }}</span>
      <span>{{ producto.origen }}</span>
    </div>
    <div class="producto-cuerpo">
      <h3>{{ producto.nombre }}</h3>
      <p class="unidad">{{ producto.unidad }}</p>
      <div class="producto-pie">
        <span class="precio plantilla">{{ soles(producto.precio_centimos) }}</span>
        <SelectorDeCantidad
          v-if="cantidad > 0"
          ref="selector"
          :nombre="nombreCompleto(producto)"
          :cantidad="cantidad"
          @cambiar="cambiar"
        />
        <button
          v-else
          ref="agregar"
          type="button"
          class="boton-mas"
          :aria-label="`Agregar ${nombreCompleto(producto)}`"
          @click="cambiar(1)"
        >+</button>
      </div>
    </div>
  </li>
</template>
