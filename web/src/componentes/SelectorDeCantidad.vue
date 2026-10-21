<script setup>
import { ref } from 'vue';
import { CANTIDAD_MAXIMA } from '../tienda.js';

defineProps({
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
});
const emit = defineEmits(['cambiar']);

const mas = ref();
defineExpose({ enfocarMas: () => mas.value.focus() });
</script>

<template>
  <div class="cantidad" role="group" :aria-label="`Cantidad de ${nombre}`">
    <button
      type="button"
      :aria-label="cantidad === 1 ? 'Quitar del pedido' : 'Quitar uno'"
      @click="emit('cambiar', -1)"
    >−</button>
    <output>{{ cantidad }}</output>
    <button
      ref="mas"
      type="button"
      aria-label="Agregar uno"
      :disabled="cantidad >= CANTIDAD_MAXIMA"
      @click="emit('cambiar', 1)"
    >+</button>
  </div>
</template>
