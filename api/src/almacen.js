export function crearAlmacen(pool) {
  return {
    async listarProductos() {
      const { rows } = await pool.query(
        'SELECT codigo, nombre, unidad, origen, imagen, precio_centimos FROM productos ORDER BY id',
      );
      return rows;
    },

    async preciosDe(codigos) {
      const { rows } = await pool.query(
        'SELECT codigo, precio_centimos FROM productos WHERE codigo = ANY($1)',
        [codigos],
      );
      return new Map(rows.map((fila) => [fila.codigo, fila.precio_centimos]));
    },

    async guardarPedido({ codigo, cliente, ciudad, total_centimos, lineas }) {
      const conexion = await pool.connect();
      try {
        await conexion.query('BEGIN');
        const { rows } = await conexion.query(
          'INSERT INTO pedidos (codigo, cliente, ciudad, total_centimos) VALUES ($1, $2, $3, $4) RETURNING id',
          [codigo, cliente, ciudad, total_centimos],
        );
        await conexion.query(
          `INSERT INTO lineas_de_pedido (pedido_id, producto_id, cantidad, precio_centimos)
           SELECT $1, productos.id, linea.cantidad, linea.precio
           FROM unnest($2::text[], $3::int[], $4::int[]) AS linea (codigo, cantidad, precio)
           JOIN productos ON productos.codigo = linea.codigo`,
          [
            rows[0].id,
            lineas.map((linea) => linea.producto),
            lineas.map((linea) => linea.cantidad),
            lineas.map((linea) => linea.precio_centimos),
          ],
        );
        await conexion.query('COMMIT');
      } catch (error) {
        await conexion.query('ROLLBACK');
        throw error;
      } finally {
        conexion.release();
      }
    },

    async buscarPedido(codigo) {
      const { rows } = await pool.query(
        'SELECT codigo, estado, total_centimos, creado_en FROM pedidos WHERE codigo = $1',
        [codigo],
      );
      return rows[0] ?? null;
    },

    async marcarDespachado(codigo) {
      await pool.query(
        "UPDATE pedidos SET estado = 'despachado', despachado_en = now() WHERE codigo = $1 AND estado = 'recibido'",
        [codigo],
      );
    },

    async comprobar() {
      await pool.query('SELECT 1');
    },
  };
}
