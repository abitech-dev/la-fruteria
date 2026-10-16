import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const TIENDA = process.env.URL_DE_LA_TIENDA ?? 'http://web:8080';
const CAPTURAS = new URL('./capturas/', import.meta.url).pathname;
const FORMATO_DE_CODIGO = /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;

let navegador;
before(async () => {
  mkdirSync(CAPTURAS, { recursive: true });
  navegador = await chromium.launch();
});
after(() => navegador.close());

async function abrirVitrina({ ancho, alto, tema = 'light' }) {
  const contexto = await navegador.newContext({
    viewport: { width: ancho, height: alto },
    locale: 'es-PE',
    colorScheme: tema,
  });
  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on('console', (mensaje) => mensaje.type() === 'error' && errores.push(mensaje.text()));
  pagina.on('pageerror', (error) => errores.push(error.message));
  await pagina.goto(TIENDA);
  await pagina.locator('.producto[data-codigo]').first().waitFor();
  await pagina.evaluate(() => document.fonts.ready);
  return { contexto, pagina, errores };
}

const terminarAnimaciones = (pagina, selector) =>
  pagina.evaluate(
    (css) => Promise.all(document.querySelector(css).getAnimations({ subtree: true }).map((a) => a.finished)),
    selector,
  );

const enfocado = (pagina) =>
  pagina.evaluate(() => document.activeElement.getAttribute('aria-label') ?? document.activeElement.id);

async function revisarAccesibilidad(pagina) {
  const { violations } = await new AxeBuilder({ page: pagina })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return violations.map((falla) => `${falla.id}: ${falla.nodes.map((nodo) => nodo.target).join(', ')}`);
}

describe('vitrina en escritorio', () => {
  it('arma un pedido, lo envía y lo sigue', async () => {
    const { contexto, pagina, errores } = await abrirVitrina({ ancho: 1280, alto: 900 });
    await pagina.screenshot({ path: `${CAPTURAS}escritorio-inicio.png`, fullPage: true });
    assert.equal(await pagina.locator('.producto[data-codigo]').count(), 6);

    await pagina.getByRole('button', { name: 'Agregar Arándanos frescos (caja de 500 g)' }).click();
    const cantidad = pagina.locator('.producto').getByRole('group', { name: 'Cantidad de Arándanos frescos (caja de 500 g)' });
    await cantidad.getByRole('button', { name: 'Agregar uno' }).click();
    assert.equal(await cantidad.locator('output').textContent(), '2');
    assert.equal(await pagina.locator('#contador-carrito').textContent(), '2');
    assert.match(await pagina.locator('#boton-pedir').textContent(), /Hacer el pedido · S\/\s44\.00/);

    await pagina.locator('#boton-pedir').click();
    const compra = pagina.getByRole('dialog', { name: 'Datos de entrega' });
    await compra.getByLabel('Tu nombre').fill('Mirella');
    await compra.locator('.ciudades label', { hasText: 'Trujillo' }).click();
    await terminarAnimaciones(pagina, '.modal[open]');
    await pagina.screenshot({ path: `${CAPTURAS}escritorio-compra.png` });
    await compra.getByRole('button', { name: /Confirmar el pedido/ }).click();
    const codigo = (await pagina.locator('.ticket-codigo').textContent()).trim();
    assert.match(codigo, FORMATO_DE_CODIGO);
    assert.equal(await pagina.locator('#contador-carrito').textContent(), '0');
    await pagina.screenshot({ path: `${CAPTURAS}escritorio-ticket.png` });

    await pagina.getByRole('button', { name: 'Seguir este pedido' }).click();
    const dialogo = pagina.getByRole('dialog', { name: 'Sigue tu pedido' });
    await dialogo.getByText('Recibido').waitFor();
    // El despachador tarda unos segundos; la ventana se actualiza sola.
    await dialogo.locator('li.hecho').nth(1).waitFor({ timeout: 15000 });
    await terminarAnimaciones(pagina, '#seguimiento');
    await pagina.screenshot({ path: `${CAPTURAS}escritorio-seguimiento.png` });
    assert.deepEqual(errores, []);
    await contexto.close();
  });

  it('filtra el catálogo por familia', async () => {
    const { contexto, pagina, errores } = await abrirVitrina({ ancho: 1280, alto: 900 });
    await pagina.getByRole('button', { name: 'Paltas', exact: true }).click();
    assert.equal(await pagina.locator('.producto[data-codigo]').count(), 2);
    assert.equal(await pagina.getByRole('button', { name: 'Paltas', exact: true }).getAttribute('aria-pressed'), 'true');
    assert.deepEqual(errores, []);
    await contexto.close();
  });

  it('la API acepta pedidos para cada ciudad que ofrece la vitrina', async () => {
    const { contexto, pagina } = await abrirVitrina({ ancho: 1280, alto: 900 });
    await pagina.getByRole('button', { name: /^Agregar .+\(/ }).first().click();
    await pagina.locator('#boton-pedir').click();
    const ciudades = await pagina.locator('input[name="ciudad"]').evaluateAll(
      (opciones) => opciones.map((opcion) => opcion.value),
    );
    assert.ok(ciudades.length > 0);
    for (const ciudad of ciudades) {
      const pedido = { cliente: 'Prueba de ciudades', ciudad, lineas: [{ producto: 'ARA-125', cantidad: 1 }] };
      const respuesta = await pagina.request.post(`${TIENDA}/api/pedidos`, { data: pedido });
      assert.equal(respuesta.status(), 201, ciudad);
    }
    await contexto.close();
  });

  it('cada producto de arándanos tiene su propio dibujo', async () => {
    const { contexto, pagina } = await abrirVitrina({ ancho: 1280, alto: 900 });
    const dibujos = await pagina.locator('.producto[data-codigo^="ARA"] .producto-imagen img').evaluateAll(
      (imagenes) => imagenes.map((imagen) => imagen.getAttribute('src')),
    );
    assert.equal(new Set(dibujos).size, 3);
    await contexto.close();
  });

  it('si el catálogo no carga, ofrece reintentar', async () => {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
    const pagina = await contexto.newPage();
    let isPrimeraVez = true;
    await pagina.route('**/api/productos', (ruta) => {
      if (!isPrimeraVez) return ruta.continue();
      isPrimeraVez = false;
      return ruta.fulfill({ status: 503 });
    });
    await pagina.goto(TIENDA);
    await pagina.getByRole('button', { name: 'Reintentar' }).click();
    await pagina.locator('.producto[data-codigo]').first().waitFor();
    assert.equal(await pagina.locator('.producto[data-codigo]').count(), 6);
    await contexto.close();
  });

  it('cumple WCAG 2.2 AA en escritorio, tablet y con las ventanas abiertas', async () => {
    const { contexto, pagina } = await abrirVitrina({ ancho: 1280, alto: 900 });
    assert.deepEqual(await revisarAccesibilidad(pagina), []);
    await pagina.getByRole('button', { name: 'Seguir pedido' }).click();
    await terminarAnimaciones(pagina, '#seguimiento');
    assert.deepEqual(await revisarAccesibilidad(pagina), []);
    await pagina.keyboard.press('Escape');
    await pagina.getByRole('button', { name: /^Agregar .+\(/ }).first().click();
    await pagina.locator('#boton-pedir').click();
    await terminarAnimaciones(pagina, '.modal[open]');
    assert.deepEqual(await revisarAccesibilidad(pagina), []);
    await contexto.close();

    const tablet = await abrirVitrina({ ancho: 768, alto: 1024 });
    await tablet.pagina.screenshot({ path: `${CAPTURAS}tablet-inicio.png`, fullPage: true });
    assert.deepEqual(await revisarAccesibilidad(tablet.pagina), []);
    await tablet.contexto.close();
  });

  it('con varios productos, el botón del pedido sigue a la vista', async () => {
    const { contexto, pagina, errores } = await abrirVitrina({ ancho: 1280, alto: 800 });
    for (let veces = 0; veces < 5; veces += 1) {
      await pagina.getByRole('button', { name: /^Agregar .+\(/ }).first().click();
    }
    await pagina.locator('#pedido').scrollIntoViewIfNeeded();
    const caja = await pagina.getByRole('button', { name: 'Hacer el pedido' }).boundingBox();
    assert.ok(caja.y + caja.height <= 800, `El botón termina en ${caja.y + caja.height} px.`);
    await pagina.screenshot({ path: `${CAPTURAS}escritorio-varios.png` });
    assert.deepEqual(errores, []);
    await contexto.close();
  });

  it('se ve en modo oscuro', async () => {
    const { contexto, pagina, errores } = await abrirVitrina({ ancho: 1280, alto: 900, tema: 'dark' });
    await pagina.screenshot({ path: `${CAPTURAS}escritorio-oscuro.png` });
    assert.deepEqual(errores, []);
    await contexto.close();
  });
});

describe('carga de la página', () => {
  it('no mueve el contenido aunque las fuentes tarden en llegar', async () => {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
    const pagina = await contexto.newPage();
    // Una conexión lenta entrega las fuentes después del primer pintado.
    await pagina.route('**/fuentes/*.woff2', async (ruta) => {
      await new Promise((listo) => setTimeout(listo, 600));
      await ruta.continue();
    });
    await pagina.addInitScript(() => {
      window.desplazamiento = 0;
      new PerformanceObserver((lista) => {
        for (const entrada of lista.getEntries()) {
          if (!entrada.hadRecentInput) window.desplazamiento += entrada.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await pagina.goto(TIENDA);
    await pagina.locator('.producto[data-codigo]').first().waitFor();
    await pagina.evaluate(() => document.fonts.ready);
    const desplazamiento = await pagina.evaluate(() => window.desplazamiento);
    assert.ok(desplazamiento < 0.1, `CLS de ${desplazamiento.toFixed(3)}; el límite es 0,1.`);
    await contexto.close();
  });
});

describe('vitrina en el celular', () => {
  it('abre el pedido como hoja desde la barra inferior y la cierra con Escape', async () => {
    const { contexto, pagina, errores } = await abrirVitrina({ ancho: 390, alto: 844 });
    await pagina.screenshot({ path: `${CAPTURAS}celular-inicio.png`, fullPage: true });
    const barra = pagina.locator('#barra-pedido');
    assert.equal(await barra.isVisible(), false);

    await pagina.getByRole('button', { name: 'Agregar Palta Hass (kilo)' }).click();
    await barra.waitFor({ state: 'visible' });
    await pagina.screenshot({ path: `${CAPTURAS}celular-barra.png` });
    await barra.click();
    await pagina.getByRole('dialog', { name: 'Tu pedido' }).waitFor();
    await terminarAnimaciones(pagina, '#pedido');
    assert.equal(await enfocado(pagina), 'Cerrar tu pedido');
    await pagina.screenshot({ path: `${CAPTURAS}celular-pedido.png` });

    await pagina.keyboard.press('Escape');
    await pagina.waitForFunction(() => !document.getElementById('pedido').classList.contains('abierta'));
    assert.equal(await enfocado(pagina), 'barra-pedido');
    assert.deepEqual(errores, []);
    await contexto.close();
  });

  it('muestra un pedido largo en la hoja, en modo oscuro', async () => {
    const { contexto, pagina, errores } = await abrirVitrina({ ancho: 390, alto: 844, tema: 'dark' });
    for (let veces = 0; veces < 4; veces += 1) {
      await pagina.getByRole('button', { name: /^Agregar .+\(/ }).first().click();
    }
    await pagina.locator('#barra-pedido').click();
    await terminarAnimaciones(pagina, '#pedido');
    await pagina.screenshot({ path: `${CAPTURAS}celular-varios-oscuro.png` });
    assert.deepEqual(await revisarAccesibilidad(pagina), []);
    assert.deepEqual(errores, []);
    await contexto.close();
  });
});
