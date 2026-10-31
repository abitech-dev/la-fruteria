import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { crearApp } from '../src/app.js';
import { isCodigoValido } from '../src/pedidos.js';

const PRODUCTOS = [
  { codigo: 'ARA-500', nombre: 'Arándanos frescos', unidad: 'caja de 500 g', origen: 'Virú', precio_centimos: 2200 },
  { codigo: 'PAL-HAS', nombre: 'Palta Hass', unidad: 'kilo', origen: 'Huánuco', precio_centimos: 990 },
];

const PEDIDO = {
  cliente: 'Mirella',
  ciudad: 'Trujillo',
  lineas: [{ producto: 'ARA-500', cantidad: 2 }, { producto: 'PAL-HAS', cantidad: 1 }],
};

function crearFalsos() {
  const estado = { lecturasDelAlmacen: 0, busquedas: 0, guardados: [], encolados: [], catalogo: null };
  const almacen = {
    async listarProductos() {
      estado.lecturasDelAlmacen += 1;
      return PRODUCTOS;
    },
    async preciosDe(codigos) {
      const encontrados = PRODUCTOS.filter((producto) => codigos.includes(producto.codigo));
      return new Map(encontrados.map((producto) => [producto.codigo, producto.precio_centimos]));
    },
    async guardarPedido(pedido) {
      estado.guardados.push(pedido);
    },
    async buscarPedido(codigo) {
      estado.busquedas += 1;
      const pedido = estado.guardados.find((guardado) => guardado.codigo === codigo);
      return pedido ? { codigo, estado: 'recibido', total_centimos: pedido.total_centimos } : null;
    },
    async comprobar() {
      estado.comprobaciones = (estado.comprobaciones ?? 0) + 1;
      if (estado.isBaseCaida) throw new Error('sin conexión');
    },
  };
  const cola = {
    async leerCatalogo() {
      return estado.catalogo;
    },
    async guardarCatalogo(productos) {
      estado.catalogo = productos;
    },
    async encolarDespacho(codigo) {
      estado.encolados.push(codigo);
    },
    async comprobar() {
      if (estado.isRedisCaido) throw new Error('sin Redis');
    },
  };
  return { estado, almacen, cola, registrar: () => {} };
}

async function conServidor(dependencias, prueba) {
  const servidor = crearApp(dependencias).listen(0);
  await new Promise((listo) => servidor.once('listening', listo));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  try {
    await prueba((ruta, opciones) => fetch(base + ruta, opciones));
  } finally {
    servidor.close();
  }
}

const enviar = (cuerpo) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
});

describe('catálogo', () => {
  it('devuelve los productos y la segunda vez los toma de la caché', async () => {
    const falsos = crearFalsos();
    await conServidor(falsos, async (pedir) => {
      assert.deepEqual(await (await pedir('/api/productos')).json(), PRODUCTOS);
      await pedir('/api/productos');
      assert.equal(falsos.estado.lecturasDelAlmacen, 1);
    });
  });
});

describe('crear un pedido', () => {
  it('lo guarda con el total calculado en el servidor y lo pone en la cola de despachos', async () => {
    const falsos = crearFalsos();
    await conServidor(falsos, async (pedir) => {
      const respuesta = await pedir('/api/pedidos', enviar({ ...PEDIDO, total_centimos: 1 }));
      const cuerpo = await respuesta.json();
      assert.equal(respuesta.status, 201);
      assert.ok(isCodigoValido(cuerpo.codigo));
      assert.equal(cuerpo.total_centimos, 5390);
      assert.equal(respuesta.headers.get('location'), `/api/pedidos/${cuerpo.codigo}`);
      assert.deepEqual(falsos.estado.encolados, [cuerpo.codigo]);
      assert.equal(falsos.estado.guardados[0].lineas[0].precio_centimos, 2200);
    });
  });

  it('responde 422 con el error de cada campo', async () => {
    await conServidor(crearFalsos(), async (pedir) => {
      const respuesta = await pedir('/api/pedidos', enviar({ ...PEDIDO, cliente: '', ciudad: 'Cusco' }));
      const { errores } = await respuesta.json();
      assert.equal(respuesta.status, 422);
      assert.ok(errores.cliente);
      assert.ok(errores.ciudad);
    });
  });

  it('rechaza un producto que no existe sin guardar ni encolar nada', async () => {
    const falsos = crearFalsos();
    await conServidor(falsos, async (pedir) => {
      const lineas = [{ producto: 'MAN-001', cantidad: 1 }];
      const respuesta = await pedir('/api/pedidos', enviar({ ...PEDIDO, lineas }));
      const { errores } = await respuesta.json();
      assert.equal(respuesta.status, 422);
      assert.match(errores.lineas, /MAN-001/);
      assert.equal(falsos.estado.guardados.length, 0);
      assert.equal(falsos.estado.encolados.length, 0);
    });
  });

  it('responde 400 si el cuerpo no es JSON', async () => {
    await conServidor(crearFalsos(), async (pedir) => {
      const respuesta = await pedir('/api/pedidos', enviar('{"cliente":'));
      assert.equal(respuesta.status, 400);
      assert.ok((await respuesta.json()).error);
    });
  });
});

describe('consultar un pedido', () => {
  it('muestra el estado y el total, sin el nombre del cliente', async () => {
    await conServidor(crearFalsos(), async (pedir) => {
      const { codigo } = await (await pedir('/api/pedidos', enviar(PEDIDO))).json();
      const pedido = await (await pedir(`/api/pedidos/${codigo}`)).json();
      assert.equal(pedido.estado, 'recibido');
      assert.equal(pedido.cliente, undefined);
    });
  });

  it('responde 404 a un código inexistente y no busca uno mal formado', async () => {
    const falsos = crearFalsos();
    await conServidor(falsos, async (pedir) => {
      assert.equal((await pedir('/api/pedidos/ABCD-EFGH')).status, 404);
      assert.equal((await pedir('/api/pedidos/1')).status, 404);
      assert.equal(falsos.estado.busquedas, 1);
    });
  });
});

describe('errores', () => {
  it('ante un fallo inesperado responde 500 sin mostrar el detalle', async () => {
    const falsos = crearFalsos();
    falsos.almacen.listarProductos = async () => {
      throw new Error('ruta interna: /app/datos');
    };
    await conServidor(falsos, async (pedir) => {
      const respuesta = await pedir('/api/productos');
      const texto = await respuesta.text();
      assert.equal(respuesta.status, 500);
      assert.doesNotMatch(texto, /datos|at /);
      assert.equal(respuesta.headers.get('x-powered-by'), null);
    });
  });
});

describe('salud', () => {
  it('responde vivo sin consultar la base de datos', async () => {
    const falsos = crearFalsos();
    await conServidor(falsos, async (pedir) => {
      const respuesta = await pedir('/salud/vivo');
      assert.equal(respuesta.status, 200);
      assert.deepEqual(await respuesta.json(), { estado: 'vivo' });
    });
    assert.equal(falsos.estado.comprobaciones, undefined);
  });

  it('responde listo cuando la base de datos contesta', async () => {
    await conServidor(crearFalsos(), async (pedir) => {
      const respuesta = await pedir('/salud/listo');
      assert.equal(respuesta.status, 200);
      assert.deepEqual(await respuesta.json(), { estado: 'listo' });
    });
  });

  it('responde 503 cuando la base de datos no contesta', async () => {
    const falsos = crearFalsos();
    falsos.estado.isBaseCaida = true;
    await conServidor(falsos, async (pedir) => {
      const respuesta = await pedir('/salud/listo');
      assert.equal(respuesta.status, 503);
      assert.deepEqual(await respuesta.json(), { estado: 'no listo' });
    });
  });

  it('responde 503 cuando Redis no contesta', async () => {
    const falsos = crearFalsos();
    falsos.estado.isRedisCaido = true;
    await conServidor(falsos, async (pedir) => {
      assert.equal((await pedir('/salud/listo')).status, 503);
    });
  });
});
