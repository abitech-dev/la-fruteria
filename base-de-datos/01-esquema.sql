CREATE TABLE productos (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo          text    NOT NULL UNIQUE,
  nombre          text    NOT NULL,
  unidad          text    NOT NULL,
  origen          text    NOT NULL,
  imagen          text    NOT NULL,
  precio_centimos integer NOT NULL CHECK (precio_centimos > 0)
);

CREATE TYPE estado_de_pedido AS ENUM ('recibido', 'despachado');

CREATE TABLE pedidos (
  id             integer          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo         text             NOT NULL UNIQUE,
  cliente        text             NOT NULL,
  ciudad         text             NOT NULL,
  estado         estado_de_pedido NOT NULL DEFAULT 'recibido',
  total_centimos integer          NOT NULL CHECK (total_centimos > 0),
  creado_en      timestamptz      NOT NULL DEFAULT now(),
  despachado_en  timestamptz
);

CREATE TABLE lineas_de_pedido (
  pedido_id       integer NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  producto_id     integer NOT NULL REFERENCES productos (id),
  cantidad        integer NOT NULL CHECK (cantidad > 0),
  precio_centimos integer NOT NULL CHECK (precio_centimos > 0),
  PRIMARY KEY (pedido_id, producto_id)
);
