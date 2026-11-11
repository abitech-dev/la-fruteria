// La campaña de arándanos en pequeño. Cada cliente virtual mira el
// catálogo y, de cada cinco visitas, en una compra.
import { check, sleep } from 'k6';
import http from 'k6/http';

const TIENDA = __ENV.TIENDA || 'http://web:8080';
const PEDIDO = JSON.stringify({
  cliente: 'Prueba de carga',
  ciudad: 'Lima',
  lineas: [{ producto: 'ARA-500', cantidad: 1 }],
});

export const options = {
  scenarios: {
    campana: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 60 },
        { duration: '2m', target: 60 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  // La prueba falla si se cae más del 1 % o si el 1 % más lento pasa de 1 s.
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(99)<1000'],
  },
};

export default function () {
  // Cada cliente llega con su dirección, como las que anota Caddy.
  const cabeceras = { 'X-Forwarded-For': `10.0.${Math.floor(__VU / 250)}.${__VU % 250}` };
  const catalogo = http.get(`${TIENDA}/api/productos`, { headers: cabeceras });
  check(catalogo, { 'catálogo 200': (r) => r.status === 200 });

  if (__ITER % 5 === 0) {
    const pedido = http.post(`${TIENDA}/api/pedidos`, PEDIDO, {
      headers: { ...cabeceras, 'Content-Type': 'application/json' },
    });
    check(pedido, { 'pedido 201': (r) => r.status === 201 });
  }
  sleep(1 + Math.random() * 2);
}
