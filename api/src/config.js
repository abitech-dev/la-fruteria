import { readFileSync } from 'node:fs';

export function leerConfig(entorno = process.env) {
  return {
    puerto: Number(entorno.PUERTO ?? 3000),
    baseDeDatos: {
      host: entorno.BD_HOST ?? 'postgres',
      port: Number(entorno.BD_PUERTO ?? 5432),
      database: entorno.BD_NOMBRE ?? 'fruteria',
      user: entorno.BD_USUARIO ?? 'fruteria',
      password: leerClave(entorno),
    },
    redisUrl: entorno.REDIS_URL ?? 'redis://redis:6379',
    demoraDeDespachoMs: Number(entorno.DEMORA_DE_DESPACHO_MS ?? 3000),
    latido: entorno.LATIDO ?? '/tmp/latido',
  };
}

// El archivo es el secreto de Compose o de Kubernetes; la variable sirve
// en los volúmenes que todavía no enseñan secretos.
function leerClave(entorno) {
  if (entorno.BD_CLAVE_ARCHIVO) return readFileSync(entorno.BD_CLAVE_ARCHIVO, 'utf8').trim();
  if (entorno.BD_CLAVE) return entorno.BD_CLAVE;
  throw new Error('Falta la clave de la base de datos. Define BD_CLAVE_ARCHIVO o BD_CLAVE.');
}
