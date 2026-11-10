#!/usr/bin/env bash
# Saca la copia de PostgreSQL y la guarda fuera del servidor con restic.
# La corre fruteria-copia.timer cada noche, como root.
set -euo pipefail
cd "$(dirname "$0")/.."

set -a
# shellcheck source=/dev/null
. secretos/copias.env
set +a

# pg_dump saca una copia coherente con la base encendida.
# Si falla, restic no guarda nada.
restic backup --quiet --tag diaria --stdin-filename fruteria.dump \
  --stdin-from-command -- \
  docker compose exec -T postgres pg_dump -U fruteria -d fruteria -Fc

# La última copia de cada día de la semana y de cada semana del mes.
restic forget --quiet --tag diaria --keep-daily 7 --keep-weekly 4 --prune
restic check --quiet
