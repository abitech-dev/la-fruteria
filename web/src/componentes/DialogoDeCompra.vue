<script setup>
import { computed, nextTick, ref } from 'vue';
import { CIUDADES, enviarPedido, soles, tienda, totalCentimos } from '../tienda.js';

const emit = defineEmits(['seguir']);

const dialogo = ref();
const seguir = ref();
const cliente = ref('');
const ciudad = ref(CIUDADES[0]);
const errorDelCliente = ref('');

const envio = computed(() => tienda.envio);
const isRecibido = computed(() => envio.value?.estado === 'recibido');

function abrir() {
  tienda.envio = null;
  errorDelCliente.value = '';
  dialogo.value.showModal();
}

function cerrar() {
  dialogo.value.close();
}

async function confirmar() {
  errorDelCliente.value = cliente.value.trim() ? '' : 'Escribe tu nombre para el despacho.';
  if (errorDelCliente.value) return;
  await enviarPedido({ cliente: cliente.value.trim(), ciudad: ciudad.value });
  if (isRecibido.value) {
    cliente.value = '';
    ciudad.value = CIUDADES[0];
    await nextTick();
    seguir.value.focus();
  } else {
    errorDelCliente.value = envio.value.errores.cliente ?? '';
  }
}

// Un clic sobre el fondo oscuro cae en el propio diálogo y lo cierra.
const cerrarSiEsElFondo = (evento) => evento.target === evento.currentTarget && cerrar();

defineExpose({ abrir, cerrar });
</script>

<template>
  <dialog ref="dialogo" class="modal" aria-labelledby="titulo-compra" @click="cerrarSiEsElFondo">
    <div class="modal-contenido">
      <div class="pedido-cabecera">
        <h2 id="titulo-compra">{{ isRecibido ? 'Pedido recibido' : 'Datos de entrega' }}</h2>
        <button type="button" class="cerrar" aria-label="Cerrar" @click="cerrar">×</button>
      </div>

      <div v-if="isRecibido" class="ticket">
        <p class="ticket-titulo">Código de despacho</p>
        <strong class="ticket-codigo plantilla">{{ envio.pedido.codigo }}</strong>
        <p>Total {{ soles(envio.pedido.total_centimos) }}. Guarda este código para seguir tu pedido.</p>
        <button ref="seguir" type="button" class="boton" @click="emit('seguir', envio.pedido.codigo)">
          Seguir este pedido
        </button>
      </div>

      <form v-else class="formulario" novalidate @submit.prevent="confirmar">
        <label for="cliente">Tu nombre</label>
        <input
          id="cliente"
          v-model="cliente"
          class="campo"
          maxlength="80"
          autocomplete="off"
          placeholder="Por ejemplo, Mirella"
          :aria-invalid="Boolean(errorDelCliente)"
          aria-describedby="error-cliente"
        >
        <p id="error-cliente" class="campo-error">{{ errorDelCliente }}</p>
        <fieldset class="ciudades">
          <legend>Ciudad de entrega</legend>
          <label v-for="nombre in CIUDADES" :key="nombre">
            <input v-model="ciudad" type="radio" name="ciudad" :value="nombre"> {{ nombre }}
          </label>
        </fieldset>
        <p v-if="envio?.mensaje" class="error" role="alert">{{ envio.mensaje }}</p>
        <button type="submit" class="boton boton-principal boton-ancho" :disabled="envio?.estado === 'enviando'">
          {{ envio?.estado === 'enviando' ? 'Enviando el pedido…' : `Confirmar el pedido · ${soles(totalCentimos)}` }}
        </button>
      </form>
    </div>
  </dialog>
</template>
