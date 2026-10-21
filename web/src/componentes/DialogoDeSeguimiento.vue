<script setup>
import { nextTick, ref } from 'vue';
import { fecha } from '../tienda.js';

const ESPERA_ENTRE_CONSULTAS_MS = 2000;

const dialogo = ref();
const campo = ref();
const codigo = ref('');
const pedido = ref(null);
const error = ref('');
let consultaProgramada = 0;

async function abrir(codigoDelPedido) {
  pedido.value = null;
  error.value = '';
  if (codigoDelPedido) codigo.value = codigoDelPedido;
  dialogo.value.showModal();
  await nextTick();
  if (codigoDelPedido) consultar();
  else campo.value.focus();
}

// Consulta cada 2 segundos hasta que el pedido sale.
async function consultar() {
  clearTimeout(consultaProgramada);
  const buscado = codigo.value.trim().toUpperCase();
  try {
    const respuesta = await fetch(`/api/pedidos/${encodeURIComponent(buscado)}`);
    if (respuesta.status === 404) {
      pedido.value = null;
      error.value = 'No hay un pedido con ese código. Revísalo en tu ticket de despacho.';
      return;
    }
    if (!respuesta.ok) throw new Error(respuesta.statusText);
    pedido.value = await respuesta.json();
    error.value = '';
    if (pedido.value.estado !== 'despachado' && dialogo.value.open) {
      consultaProgramada = setTimeout(consultar, ESPERA_ENTRE_CONSULTAS_MS);
    }
  } catch {
    error.value = 'No pudimos consultar el pedido. Vuelve a intentarlo en un momento.';
  }
}

const detenerConsultas = () => clearTimeout(consultaProgramada);
const cerrarSiEsElFondo = (evento) => evento.target === evento.currentTarget && dialogo.value.close();

defineExpose({ abrir });
</script>

<template>
  <dialog
    id="seguimiento"
    ref="dialogo"
    class="modal seguimiento"
    aria-labelledby="titulo-seguimiento"
    @close="detenerConsultas"
    @click="cerrarSiEsElFondo"
  >
    <div class="modal-contenido">
      <div class="pedido-cabecera">
        <h2 id="titulo-seguimiento">Sigue tu pedido</h2>
        <button type="button" class="cerrar" aria-label="Cerrar el seguimiento" @click="dialogo.close()">×</button>
      </div>
      <p>Escribe el código de tu ticket de despacho.</p>
      <form class="formulario formulario-en-linea" @submit.prevent="consultar">
        <label for="codigo" class="solo-lector">Código del pedido</label>
        <input
          id="codigo"
          ref="campo"
          v-model="codigo"
          class="campo"
          required
          placeholder="ABCD-2345"
          autocomplete="off"
          spellcheck="false"
        >
        <button type="submit" class="boton boton-principal">Consultar</button>
      </form>
      <div class="resultado" role="status" aria-live="polite">
        <p v-if="error" class="error">{{ error }}</p>
        <ol v-else-if="pedido" class="linea-de-tiempo" :aria-label="`Estado del pedido ${pedido.codigo}`">
          <li class="hecho">
            <strong>Recibido</strong>
            <span>{{ fecha(pedido.creado_en) }}</span>
          </li>
          <li :class="{ hecho: pedido.estado === 'despachado' }">
            <strong>Despachado</strong>
            <span>{{ pedido.estado === 'despachado' ? fecha(pedido.despachado_en) : 'En preparación' }}</span>
          </li>
        </ol>
      </div>
    </div>
  </dialog>
</template>
