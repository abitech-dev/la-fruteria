# La Frutería

Tienda en línea de arándanos y paltas que acompaña a la colección «Contenedores con peras y manzanas».
Cada volumen la lleva un paso más lejos, de una página en tu laptop a un clúster de Kubernetes.

Esta es la aplicación completa, con Compose y la seguridad del volumen 5.
Qué gana en cada capítulo, y con qué etiqueta de Git, está en la [hoja de ruta](docs/hoja-de-ruta.md).

## Qué tiene

| Servicio | Qué hace | Imagen base |
| --- | --- | --- |
| `web` | La vitrina en Vue, compilada con Vite y servida por nginx sin privilegios | `node:24-alpine` para compilar y `nginxinc/nginx-unprivileged:1.30-alpine` para servir |
| `api` | La API de pedidos, en Node.js con Express | `node:24-alpine` |
| `despachador` | Toma los pedidos de la cola y los marca como despachados, con la misma imagen de la API | `node:24-alpine` |
| `postgres` | El catálogo y los pedidos | `postgres:18-alpine` |
| `redis` | La caché del catálogo y la cola de despachos | `redis:8-alpine` |

Todas las imágenes están fijadas por digest.
Solo `web` publica un puerto, y solo en `127.0.0.1`.
La base de datos y Redis viven en una red sin salida a internet.

## Requisitos

- Docker Engine 29 o Docker Desktop, con Compose 5.
- Node.js 22 o superior, solo para las pruebas.
- OpenSSL, para crear la clave de la base de datos.

## Puesta en marcha

1. Crea la clave de la base de datos, una sola vez:

   ```bash
   openssl rand -hex 24 > secretos/bd_clave.txt
   ```

2. Levanta la tienda:

   ```bash
   docker compose up --build --wait
   ```

3. Abre <http://localhost:8080>.

`docker compose down` la detiene y `docker compose down -v` borra además los pedidos y el catálogo.
La base de datos lee su clave solo al crearse; si cambias el archivo, bórrala con `-v`.

## Pruebas

| Pruebas | Comando | Necesita |
| --- | --- | --- |
| Unitarias de la API (24) | `cd api && npm ci && npm test` | Node.js |
| De la vitrina (11) | ver abajo | Docker |
| De humo contra la tienda (8) | `node --test "pruebas/*.test.mjs"` | La tienda en marcha |
| En navegador (10), con accesibilidad WCAG 2.2 AA en escritorio, tablet y celular | ver abajo | La tienda en marcha |

Las pruebas de la vitrina corren con Vitest en Node 24, el mismo de la imagen:

```bash
docker run --rm -v "$PWD/web:/app" -v /app/node_modules -w /app node:24-alpine sh -c "npm ci && npm test"
```

Las pruebas en navegador corren con Playwright dentro de un contenedor, en la red de la tienda:

```bash
docker run --rm --network la-fruteria_frente \
  -v "$PWD/pruebas/navegador:/pruebas" -v /pruebas/node_modules -w /pruebas \
  mcr.microsoft.com/playwright:v1.64.1-noble sh -c "npm ci && node --test"
```

En Git Bash para Windows, antepón `MSYS_NO_PATHCONV=1` al comando.
Las capturas quedan en `pruebas/navegador/capturas/`.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `api/` | La API y el despachador, con sus pruebas |
| `web/` | La vitrina en Vue (`src/`), sus imágenes y fuentes (`public/`), nginx y su Dockerfile de dos etapas |
| `base-de-datos/` | El esquema y el catálogo inicial de PostgreSQL |
| `pruebas/` | Las pruebas de humo y las de navegador |
| `secretos/` | La clave de la base de datos; Git no la guarda |
| `docs/` | La hoja de ruta por capítulo |

Para trabajar en la vitrina con recarga al guardar, levanta la tienda con Compose y corre `npm run dev` en `web/`.
Vite la sirve en <http://localhost:5173> y pasa las llamadas a `/api` a la tienda.

Las fuentes de `web/public/fuentes/` tienen licencia SIL Open Font License; sus textos están junto a ellas.
