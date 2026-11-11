#!/usr/bin/env bash
# Corre una orden y muestra el pico de consumo de cada caja, y cuántas
# veces el núcleo la frenó por pasar su tope de procesador.
set -euo pipefail

muestras=$(mktemp)
frenos=$(mktemp)
trap 'rm -f "$muestras" "$frenos"' EXIT

# El núcleo cuenta los frenos en el cpu.stat del grupo de cada caja.
contar_frenos() {
  docker ps --format '{{.ID}} {{.Names}}' | while read -r id nombre; do
    archivo=$(find /sys/fs/cgroup -maxdepth 3 -type d -name "*${id}*" \
      -exec printf '%s/cpu.stat' {} \; -quit)
    [ -f "$archivo" ] || continue
    echo "$nombre $(awk '/^nr_throttled/ {print $2}' "$archivo")"
  done
}

contar_frenos > "$frenos"
"$@" &
orden=$!
while kill -0 "$orden" 2>/dev/null; do
  docker stats --no-stream \
    --format '{{.Name}} {{.MemUsage}} {{.CPUPerc}}' >> "$muestras"
  sleep 5
done
estado=0
wait "$orden" || estado=$?
contar_frenos | sed 's/^/final /' >> "$frenos"

printf '%-30s %11s %8s %6s\n' caja memoria cpu frenos
# docker stats escribe la memoria en B, KiB, MiB o GiB; todo pasa a MiB.
awk '
  NR == FNR {
    if ($1 == "final") frenos[$2] = $3 - inicio[$2]
    else inicio[$1] = $2
    next
  }
  {
    valor = $2 + 0
    if ($2 ~ /GiB/) valor *= 1024
    else if ($2 ~ /KiB/) valor /= 1024
    else if ($2 !~ /MiB/) valor /= 1048576
    if (valor > memoria[$1]) memoria[$1] = valor
    if ($5 + 0 > cpu[$1]) cpu[$1] = $5 + 0
  }
  END {
    for (caja in memoria) {
      printf "%-30s %7.1f MiB %6.1f %% %6d\n", caja, memoria[caja], cpu[caja], frenos[caja]
    }
  }
' "$frenos" "$muestras" | sort -k2 -nr
exit "$estado"
