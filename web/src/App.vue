<script setup>
import { computed, onMounted, ref } from 'vue';
import TarjetaProducto from './componentes/TarjetaProducto.vue';
import { CIUDADES, cargarCatalogo, familiaDe, tienda } from './tienda.js';

const FILTROS = [
  { familia: 'todo', nombre: 'Todo' },
  { familia: 'arandanos', nombre: 'Arándanos' },
  { familia: 'paltas', nombre: 'Paltas' },
  { familia: 'cajas', nombre: 'Cajas' },
];

const filtro = ref('todo');

const visibles = computed(() =>
  tienda.productos.filter((producto) => filtro.value === 'todo' || familiaDe(producto.codigo) === filtro.value),
);
const isCargando = computed(() => tienda.productos.length === 0 && !tienda.isCatalogoConError);

onMounted(cargarCatalogo);
</script>

<template>
  <a class="saltar" href="#catalogo">Ir al catálogo</a>

  <header class="barra-superior">
    <a class="marca" href="#inicio">
      <img src="/img/logo.svg" alt="" width="40" height="40">
      <span class="marca-nombre plantilla">La Frutería</span>
    </a>
  </header>

  <main id="inicio">
    <section class="portada">
      <div class="portada-contenido">
        <div>
          <p class="etiqueta">Arándanos de Virú · Paltas de Huánuco</p>
          <h1 class="plantilla">Calidad de exportación</h1>
          <p class="bajada">
            Fruta seleccionada a mano y despachada a tu puerta en {{ CIUDADES.slice(0, -1).join(', ') }}
            y {{ CIUDADES.at(-1) }}.
          </p>
          <a class="boton boton-claro" href="#catalogo">Ver la fruta</a>
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
    </section>

    <section id="catalogo" class="catalogo tienda" aria-labelledby="titulo-catalogo">
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
      <p class="nota">Muy pronto podrás hacer tu pedido en línea.</p>
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
  </main>

  <footer class="pie">
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
    </div>
    <p class="pie-credito">Tienda de ejemplo de «Contenedores con peras y manzanas».</p>
  </footer>
</template>
