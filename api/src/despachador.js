import { writeFileSync } from 'node:fs';
import { setTimeout as esperar } from 'node:timers/promises';
import { leerConfig } from './config.js';
import { conectar } from './conexiones.js';
import { registrar } from './registro.js';

const SEGUNDOS_DE_ESPERA_EN_LA_COLA = 5;

const config = leerConfig();
const { almacen, cola, cerrar } = await conectar(config, registrar);

let isDetenido = false;
for (const senal of ['SIGTERM', 'SIGINT']) {
  process.once(senal, () => {
    isDetenido = true;
    registrar('info', 'deteniendo el despachador al terminar el pedido en curso', { senal });
  });
}

registrar('info', 'despachador esperando pedidos');
while (!isDetenido) {
  // Señal de vida para el healthcheck.
  writeFileSync(config.latido, String(Date.now()));
  const codigo = await cola.tomarDespacho(SEGUNDOS_DE_ESPERA_EN_LA_COLA);
  if (!codigo) continue;
  try {
    await esperar(config.demoraDeDespachoMs);
    await almacen.marcarDespachado(codigo);
    registrar('info', 'pedido despachado', { codigo });
  } catch (error) {
    registrar('error', 'no se pudo despachar; vuelve a la cola', { codigo, motivo: error.message });
    await cola.encolarDespacho(codigo);
    await esperar(1000);
  }
}
await cerrar();
