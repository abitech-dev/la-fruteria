-- Los cambios de la base después del esquema inicial. El despliegue los
-- aplica cada vez, así que cada uno se puede aplicar dos veces.

-- La versión anterior de la API no conoce esta columna y la deja vacía.
-- Así, las dos versiones guardan pedidos mientras dura el despliegue.
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS atendido_por text;
