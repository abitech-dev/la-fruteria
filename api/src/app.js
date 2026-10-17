import express from 'express';
import { calcularTotal, generarCodigo, isCodigoValido, validarPedido } from './pedidos.js';

export function crearApp({ almacen, registrar }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use(registrarSolicitudes(registrar));

  app.get('/api/productos', async (_solicitud, respuesta) => {
    respuesta.json(await almacen.listarProductos());
  });

  app.post('/api/pedidos', async (solicitud, respuesta) => {
    const { pedido, errores } = validarPedido(solicitud.body);
    if (errores) return respuesta.status(422).json({ errores });

    const codigos = pedido.lineas.map((linea) => linea.producto);
    const precios = await almacen.preciosDe(codigos);
    const desconocidos = codigos.filter((codigo) => !precios.has(codigo));
    if (desconocidos.length > 0) {
      return respuesta.status(422).json({ errores: { lineas: `No existe el producto ${desconocidos.join(', ')}.` } });
    }

    const codigo = generarCodigo();
    const total = calcularTotal(pedido.lineas, precios);
    const lineas = pedido.lineas.map((linea) => ({ ...linea, precio_centimos: precios.get(linea.producto) }));
    await almacen.guardarPedido({ ...pedido, lineas, codigo, total_centimos: total });
    respuesta
      .status(201)
      .location(`/api/pedidos/${codigo}`)
      .json({ codigo, estado: 'recibido', total_centimos: total });
  });

  app.get('/api/pedidos/:codigo', async (solicitud, respuesta) => {
    const { codigo } = solicitud.params;
    const pedido = isCodigoValido(codigo) ? await almacen.buscarPedido(codigo) : null;
    if (!pedido) return respuesta.status(404).json({ error: 'No encontramos ese pedido.' });
    respuesta.json(pedido);
  });

  app.use((_solicitud, respuesta) => respuesta.status(404).json({ error: 'No existe esa ruta.' }));
  app.use(responderError(registrar));
  return app;
}

function registrarSolicitudes(registrar) {
  return (solicitud, respuesta, siguiente) => {
    const inicio = performance.now();
    respuesta.on('finish', () => {
      registrar('info', 'solicitud', {
        metodo: solicitud.method,
        ruta: solicitud.route?.path ?? 'otra',
        estado: respuesta.statusCode,
        ms: Math.round(performance.now() - inicio),
      });
    });
    siguiente();
  };
}

// Express reconoce un manejador de errores por sus cuatro parámetros.
function responderError(registrar) {
  return (error, _solicitud, respuesta, _siguiente) => {
    if (error.type === 'entity.parse.failed') {
      return respuesta.status(400).json({ error: 'El cuerpo no es JSON válido.' });
    }
    if (error.type === 'entity.too.large') {
      return respuesta.status(413).json({ error: 'El pedido es demasiado grande.' });
    }
    registrar('error', 'fallo inesperado', { motivo: error.message, pila: error.stack });
    respuesta.status(500).json({ error: 'Algo falló de nuestro lado. Intenta de nuevo.' });
  };
}
