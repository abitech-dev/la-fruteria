// Una línea JSON por evento, para `docker logs`.
export function registrar(nivel, mensaje, datos = {}) {
  const linea = JSON.stringify({ momento: new Date().toISOString(), nivel, mensaje, ...datos });
  (nivel === 'error' ? process.stderr : process.stdout).write(`${linea}\n`);
}
