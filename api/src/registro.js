// Una línea JSON por evento, a la salida estándar, para que Docker la recoja.
export function registrar(nivel, mensaje, datos = {}) {
  const linea = JSON.stringify({ momento: new Date().toISOString(), nivel, mensaje, ...datos });
  (nivel === 'error' ? process.stderr : process.stdout).write(`${linea}\n`);
}
