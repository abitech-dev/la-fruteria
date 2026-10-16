<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import DialogoDeCompra from './componentes/DialogoDeCompra.vue';
import DialogoDeSeguimiento from './componentes/DialogoDeSeguimiento.vue';
import PanelDelPedido from './componentes/PanelDelPedido.vue';
import TarjetaProducto from './componentes/TarjetaProducto.vue';
import { CIUDADES, cargarCatalogo, familiaDe, soles, tienda, totalCentimos, unidades } from './tienda.js';

const FILTROS = [
  { familia: 'todo', nombre: 'Todo' },
  { familia: 'arandanos', nombre: 'Arándanos' },
  { familia: 'paltas', nombre: 'Paltas' },
  { familia: 'cajas', nombre: 'Cajas' },
];
const escritorio = window.matchMedia('(min-width: 64rem)');

const filtro = ref('todo');
const isHojaAbierta = ref(false);
const panel = ref();
const compra = ref();
const seguimiento = ref();
let disparador = null;

const visibles = computed(() =>
  tienda.productos.filter((producto) => filtro.value === 'todo' || familiaDe(producto.codigo) === filtro.value),
);
const isCargando = computed(() => tienda.productos.length === 0 && !tienda.isCatalogoConError);

async function abrirPedido(evento) {
  disparador = evento.currentTarget;
  if (escritorio.matches) {
    panel.value.enfocar();
    return;
  }
  isHojaAbierta.value = true;
  await nextTick();
  panel.value.enfocarCierre();
}

// Espera a que Vue quite el inert para devolver el foco.
async function cerrarPedido({ isFocoDeVuelta = true } = {}) {
  if (!isHojaAbierta.value) return;
  isHojaAbierta.value = false;
  await nextTick();
  if (isFocoDeVuelta) disparador?.focus();
}

function comprar() {
  cerrarPedido({ isFocoDeVuelta: false });
  compra.value.abrir();
}

function seguirPedido(codigo) {
  compra.value.cerrar();
  seguimiento.value.abrir(codigo);
}

watch(isHojaAbierta, (isAbierta) => document.body.classList.toggle('con-hoja', isAbierta));
escritorio.addEventListener('change', () => cerrarPedido({ isFocoDeVuelta: false }));
document.addEventListener('keydown', (evento) => evento.key === 'Escape' && cerrarPedido());
onMounted(cargarCatalogo);
</script>

<template>
  <a class="saltar" href="#catalogo">Ir al catálogo</a>

  <header class="barra-superior" :inert="isHojaAbierta">
    <a class="marca" href="#inicio">
      <img src="/img/logo.svg" alt="" width="40" height="40">
      <span class="marca-nombre plantilla">La Frutería</span>
    </a>
    <div class="acciones-superiores">
      <button type="button" class="boton-seguir" aria-haspopup="dialog" @click="seguimiento.abrir()">
        Seguir pedido
      </button>
      <button
        type="button"
        class="boton-carrito"
        aria-controls="pedido"
        :aria-expanded="isHojaAbierta"
        @click="abrirPedido"
      >
        Tu pedido <span id="contador-carrito" :key="unidades" class="contador">{{ unidades }}</span>
      </button>
    </div>
  </header>

  <main id="inicio">
    <section class="portada" :inert="isHojaAbierta">
      <div class="portada-contenido">
        <div>
          <p class="etiqueta">Arándanos de Virú · Paltas de Huánuco</p>
          <h1 class="plantilla">Calidad de exportación</h1>
          <p class="bajada">
            Fruta seleccionada a mano y despachada a tu puerta en {{ CIUDADES.slice(0, -1).join(', ') }}
            y {{ CIUDADES.at(-1) }}.
          </p>
          <a class="boton boton-claro" href="#catalogo">Elegir fruta</a>
        </div>
        <div class="portada-figura">
          <img src="/img/portada.svg" alt="" width="360" height="300">
          <svg class="sello" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id="giro-del-sello" d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0" />
            </defs>
            <circle cx="60" cy="60" r="58" fill="#1e2050" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="2" />
            <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" stroke-width="2" />
            <text font-size="11" letter-spacing="1" fill="currentColor">
              <textPath href="#giro-del-sello" textLength="265" lengthAdjust="spacing">
                SELECCIONADO A MANO · VIRÚ · HUÁNUCO ·
              </textPath>
            </text>
            <text x="60" y="70" font-size="28" text-anchor="middle" fill="currentColor">PE</text>
          </svg>
        </div>
      </div>
      <ol class="pasos">
        <li><span><strong>Eliges tu fruta</strong> del catálogo de la semana.</span></li>
        <li><span><strong>Recibes un código</strong> al hacer el pedido.</span></li>
        <li><span><strong>Sigues tu pedido</strong> hasta que sale del almacén.</span></li>
      </ol>
    </section>

    <div class="tienda">
      <section id="catalogo" class="catalogo" aria-labelledby="titulo-catalogo" :inert="isHojaAbierta">
        <div class="catalogo-cabecera">
          <h2 id="titulo-catalogo">Catálogo</h2>
          <div class="filtros" role="group" aria-label="Mostrar">
            <button
              v-for="opcion in FILTROS"
              :key="opcion.familia"
              type="button"
              class="filtro"
              :aria-pressed="filtro === opcion.familia"
              @click="filtro = opcion.familia"
            >{{ opcion.nombre }}</button>
          </div>
        </div>
        <p id="estado-catalogo" class="aviso" role="status">
          <template v-if="tienda.isCatalogoConError">
            No pudimos cargar el catálogo.
            <button type="button" class="boton" @click="cargarCatalogo">Reintentar</button>
          </template>
        </p>
        <ul id="productos" class="productos" :aria-busy="isCargando">
          <template v-if="isCargando">
            <li v-for="numero in 3" :key="numero" class="producto esqueleto" aria-hidden="true" />
          </template>
          <TarjetaProducto v-for="producto in visibles" :key="producto.codigo" :producto="producto" />
        </ul>
      </section>

      <PanelDelPedido ref="panel" :abierta="isHojaAbierta" @cerrar="cerrarPedido()" @comprar="comprar" />
    </div>
  </main>

  <button
    v-if="unidades > 0"
    id="barra-pedido"
    type="button"
    class="barra-pedido"
    aria-controls="pedido"
    :aria-expanded="isHojaAbierta"
    :inert="isHojaAbierta"
    @click="abrirPedido"
  >
    <span>{{ unidades === 1 ? '1 producto' : `${unidades} productos` }}</span>
    <span>Ver pedido · <strong :key="totalCentimos" class="latido">{{ soles(totalCentimos) }}</strong></span>
  </button>
  <div v-if="isHojaAbierta" class="velo" @click="cerrarPedido()" />

  <DialogoDeCompra ref="compra" @seguir="seguirPedido" />
  <DialogoDeSeguimiento ref="seguimiento" />

  <footer class="pie" :inert="isHojaAbierta">
    <div class="pie-contenido">
      <div>
        <img class="pie-logo" src="/img/logo.svg" alt="" width="44" height="44">
        <p class="pie-nombre plantilla">La Frutería</p>
        <p class="pie-descripcion">Arándanos de Virú y paltas de Huánuco, seleccionados a mano.</p>
      </div>
      <div>
        <h2 class="pie-titulo">Despachamos a</h2>
        <ul class="pie-lista">
          <li v-for="ciudad in CIUDADES" :key="ciudad">{{ ciudad }}</li>
        </ul>
      </div>
      <div>
        <h2 class="pie-titulo">Tu pedido</h2>
        <ul class="pie-lista">
          <li><a class="enlace" href="#catalogo">Elegir fruta</a></li>
          <li>
            <button type="button" class="enlace" aria-haspopup="dialog" @click="seguimiento.abrir()">
              Seguir un pedido
            </button>
          </li>
        </ul>
      </div>
    </div>
    <p class="pie-credito">Tienda de ejemplo de «Contenedores con peras y manzanas».</p>
  </footer>
</template>
