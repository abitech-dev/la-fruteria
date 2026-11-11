#!/usr/bin/env bash
# Corre una orden, como la prueba de carga, y anota cada 5 segundos
# cuánto consume cada caja. Al final muestra el pico de cada una.
set -euo pipefail

muestras=$(mktemp)
trap 'rm -f "$muestras"' EXIT

"$@" &
orden=$!
while kill -0 "$orden" 2>/dev/null; do
  docker stats --no-stream \
    --format '{{.Name}} {{.MemUsage}} {{.CPUPerc}}' >> "$muestras"
  sleep 5
done
estado=0
wait "$orden" || estado=$?

# docker stats escribe la memoria en B, KiB, MiB o GiB; todo pasa a MiB.
awk '
  {
    valor = $2 + 0
    if ($2 ~ /GiB/) valor *= 1024
    else if ($2 ~ /KiB/) valor /= 1024
    else if ($2 !~ /MiB/) valor /= 1048576
    if (valor > memoria[$1]) memoria[$1] = valor
    if ($5 + 0 > cpu[$1]) cpu[$1] = $5 + 0
  }
  END {
    for (caja in memoria) printf "%-30s %7.1f MiB %6.1f %%\n", caja, memoria[caja], cpu[caja]
  }
' "$muestras" | sort -k2 -nr
exit "$estado"
