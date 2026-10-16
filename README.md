# La Frutería

Tienda en línea de arándanos de Virú y paltas de Huánuco.
Es el proyecto de ejemplo de la colección «Contenedores con peras y manzanas».

Solo necesitas Docker con Compose 5. Todo corre en contenedores.

## Arrancar

1. Crea la clave de la base de datos, una sola vez:

   ```bash
   docker run --rm -v "$PWD/secretos:/secretos" node:24-alpine node -e "require('node:fs').writeFileSync('/secretos/bd_clave.txt', require('node:crypto').randomBytes(24).toString('hex'))"
   ```

2. Levanta la tienda:

   ```bash
   docker compose up --build --wait
   ```

3. Abre <http://localhost:8080>.

En Git Bash para Windows, antepón `MSYS_NO_PATHCONV=1` a cada `docker run`.

## Uso diario

| Quiero | Comando |
| --- | --- |
| Ver un cambio del código | `docker compose up --build --wait` |
| Leer los registros de la API | `docker compose logs -f api` |
| Detener la tienda | `docker compose down` |
| Empezar de cero, sin pedidos | `docker compose down -v` |

La base de datos lee la clave solo al crearse. Si cambias la clave, empieza de cero.

## Servicios

| Servicio | Qué hace |
| --- | --- |
| `web` | La vitrina en Vue. Node la compila y nginx la sirve. |
| `api` | Recibe y valida los pedidos. |
| `despachador` | Toma los pedidos de la cola y los despacha. |
| `postgres` | Guarda el catálogo y los pedidos. |
| `redis` | Guarda la cola de despachos y la caché del catálogo. |

Solo `web` publica un puerto, y solo en tu máquina.
La base de datos y Redis no tienen salida a internet.

## Pruebas

| Pruebas | Qué revisan |
| --- | --- |
| De la API (24) | Precios, totales y validación de pedidos. |
| De humo (7) | Que los cinco servicios funcionen juntos. |
| En navegador (11) | La compra, el seguimiento y la accesibilidad. |

Las dos últimas necesitan la tienda en marcha.

```bash
# De la API
docker run --rm -v "$PWD/api:/app" -v /app/node_modules -w /app node:24-alpine sh -c "npm ci && npm test"

# De humo
docker run --rm --network la-fruteria_frente -e URL_DE_LA_TIENDA=http://web:8080 \
  -v "$PWD/pruebas:/pruebas" -w /pruebas node:24-alpine node --test humo.test.mjs

# En navegador; deja capturas en pruebas/navegador/capturas/
docker run --rm --network la-fruteria_frente \
  -v "$PWD/pruebas/navegador:/pruebas" -v /pruebas/node_modules -w /pruebas \
  mcr.microsoft.com/playwright:v1.64.1-noble sh -c "npm ci && node --test"
```

## Carpetas

| Carpeta | Contenido |
| --- | --- |
| `api/` | La API y el despachador, con sus pruebas. |
| `web/` | La vitrina: `src/` en Vue, `public/` con imágenes y fuentes. |
| `base-de-datos/` | El esquema y el catálogo inicial. |
| `pruebas/` | Las pruebas de humo y en navegador. |
| `secretos/` | La clave de la base de datos. Git no la guarda. |
| `docs/` | La [hoja de ruta](docs/hoja-de-ruta.md): qué gana la tienda en cada capítulo del libro. |

Las fuentes de `web/public/fuentes/` tienen licencia SIL Open Font License.
