# La Frutería

Tienda en línea de arándanos de Virú y paltas de Huánuco.
Es el proyecto que construyes capítulo a capítulo en la colección «Contenedores con peras y manzanas».

## Cómo se usa

Cada capítulo tiene una etiqueta de Git con su volumen y su número, como `vol02-cap03`.
La etiqueta guarda la tienda como queda al terminar ese capítulo.
Para empezar un laboratorio, crea tu rama desde la etiqueta del capítulo anterior:

```bash
git switch -c mi-tienda vol02-cap02
```

Si te pierdes, compara tu trabajo con la etiqueta del capítulo, como en `git diff vol02-cap03`.

## Pruebas

Las pruebas de la API también corren en un contenedor. En Git Bash para Windows, antepón `MSYS_NO_PATHCONV=1` al comando.

```bash
docker run --rm -v "$PWD/api:/app" -v /app/node_modules -w /app node:24-alpine sh -c "npm ci && npm test"
```

## Autor y licencia

La Frutería la escribió Abimael Epifanio Fernandez Ventura para la colección «Contenedores con peras y manzanas».
Si quieres escribirle, su correo es <abimaelfv@hotmail.com>.

El código tiene licencia MIT, que está en [LICENSE](LICENSE).
