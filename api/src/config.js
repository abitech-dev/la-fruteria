export function leerConfig(entorno = process.env) {
  if (!entorno.BD_CLAVE) throw new Error('Falta la clave de la base de datos. Define BD_CLAVE.');
  return {
    puerto: Number(entorno.PUERTO ?? 3000),
    baseDeDatos: {
      host: entorno.BD_HOST ?? 'postgres',
      port: Number(entorno.BD_PUERTO ?? 5432),
      database: entorno.BD_NOMBRE ?? 'fruteria',
      user: entorno.BD_USUARIO ?? 'fruteria',
      password: entorno.BD_CLAVE,
    },
    redisUrl: entorno.REDIS_URL ?? 'redis://redis:6379',
    demoraDeDespachoMs: Number(entorno.DEMORA_DE_DESPACHO_MS ?? 3000),
    latido: entorno.LATIDO ?? '/tmp/latido',
  };
}
