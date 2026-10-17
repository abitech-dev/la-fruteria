<script setup>
import { familiaDe, soles } from '../tienda.js';

defineProps({ producto: { type: Object, required: true } });
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
      </div>
    </div>
  </li>
</template>
