import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export function crearMetricas() {
  const registro = new Registry();
  collectDefaultMetrics({ register: registro });
  return {
    pedidosCreados: new Counter({
      name: 'fruteria_pedidos_creados_total',
      help: 'Pedidos que la API recibió y puso en la cola de despachos.',
      registers: [registro],
    }),
    duracionDeSolicitudes: new Histogram({
      name: 'fruteria_solicitudes_http_segundos',
      help: 'Tiempo de respuesta de la API, por ruta y estado.',
      labelNames: ['metodo', 'ruta', 'estado'],
      registers: [registro],
    }),
    tipo: registro.contentType,
    exponer: () => registro.metrics(),
  };
}
