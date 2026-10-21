# Hoja de ruta de La Frutería

Para quien escribe un capítulo o prepara su laboratorio.
Dice qué gana la tienda en cada capítulo y qué etiqueta de Git marca ese estado.

## Cómo se usa

- Cada capítulo tiene una etiqueta `volNN-capMM`, por ejemplo `vol02-cap03`, que guarda la tienda como queda al terminarlo. El lector empieza cada laboratorio desde la etiqueta del capítulo anterior.
- Un capítulo «sin cambios» no toca el proyecto; su etiqueta apunta al mismo commit que la anterior.
- Las etiquetas se crean en los laboratorios de cada volumen, cuando su escaleta está cerrada.
  Si la escaleta cambia lo que gana un capítulo, esta hoja se corrige en el mismo cambio.
- Los títulos de los capítulos mandan en el plan de la colección; aquí van abreviados.
- Las etiquetas viven en la rama `lector`, que arma la tienda paso a paso, como la construye el lector.
- La rama `main` guarda la aplicación completa, que llega hasta el volumen 5.
  Lo que piden los volúmenes 6 a 9 se agrega en sus laboratorios.

## Volumen 0 · Antes de zarpar

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | La terminal | El repositorio clonado, con solo el README. | `vol00-cap01` |
| 2 | Archivos y permisos | La carpeta `web/` con la vitrina en Vue. | `vol00-cap02` |
| 3 | Procesos y servicios | Sin cambios. | `vol00-cap03` |
| 4 | Variables de entorno | Sin cambios. | `vol00-cap04` |
| 5 | Redes | Sin cambios. | `vol00-cap05` |
| 6 | HTTP | Sin cambios. | `vol00-cap06` |
| 7 | YAML, JSON y Git | El primer commit propio y el `.gitignore`. | `vol00-cap07` |

## Volumen 1 · La caja mágica

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | En mi máquina sí funciona | Sin cambios. | `vol01-cap01` |
| 2 | Instalar Docker | Sin cambios. | `vol01-cap02` |
| 3 | Imagen y contenedor | Sin cambios. | `vol01-cap03` |
| 4 | Máquinas virtuales | Sin cambios. | `vol01-cap04` |
| 5 | Primer servidor web | Tres vitrinas, `lima`, `sur` y `norte`, corren en nginx en `127.0.0.1`, puertos 8081 a 8083, todavía con la página de ejemplo. | `vol01-cap05` |
| 6 | Vida de un contenedor | La vitrina de Lima vuelve sola cuando Docker reinicia, con `unless-stopped`. | `vol01-cap06` |
| 7 | Mirar dentro | Sin cambios. | `vol01-cap07` |
| 8 | Limpieza | Sin cambios. | `vol01-cap08` |
| 9 | Quién mueve las cajas | Sin cambios. | `vol01-cap09` |

## Volumen 2 · La ficha de empaque

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | Capas | Sin cambios. | `vol02-cap01` |
| 2 | Etiquetas y digests | La imagen de nginx fijada por digest. | `vol02-cap02` |
| 3 | Primer Dockerfile | La vitrina compilada y servida dentro de una imagen de Node, todavía pesada, porque el lector solo tiene Docker. | `vol02-cap03` |
| 4 | Contexto y `.dockerignore` | El `.dockerignore` deja fuera `node_modules`, `dist` y los archivos de claves. | `vol02-cap04` |
| 5 | Instrucciones que confunden | La API de pedidos en su imagen, con los pedidos en un archivo dentro de la caja y el usuario `node`. | `vol02-cap05` |
| 6 | Caché de capas | El Dockerfile de la API copia primero las dependencias. | `vol02-cap06` |
| 7 | Multietapa | La vitrina en dos etapas, Node compila y nginx sirve; la API, sin herramientas de compilación. | `vol02-cap07` |
| 8 | Imágenes a dieta | La API sobre Alpine, comparada con slim y distroless. | `vol02-cap08` |
| 9 | Registros | Las dos imágenes publicadas en GHCR. | `vol02-cap09` |
| 10 | BuildKit y Bake | Imágenes para amd64 y arm64 con un archivo de Bake. | `vol02-cap10` |

## Volumen 3 · Bodegas y caminos

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | La capa escribible | Sin cambios; los pedidos del archivo sobreviven a `docker restart` y se pierden con `docker rm`. | `vol03-cap01` |
| 2 | Volúmenes con nombre | Sin cambios en el repositorio; los pedidos van en el volumen `pedidos`. | `vol03-cap02` |
| 3 | Bind mounts y tmpfs | Sin cambios en el repositorio; la vitrina se edita en vivo con Vite y la carpeta `web` montada. | `vol03-cap03` |
| 4 | Copias de seguridad | Sin cambios en el repositorio; el volumen `pedidos` se copia a un archivo y se restaura con sus permisos. | `vol03-cap04` |
| 5 | Redes bridge | Sin cambios en el repositorio; la vitrina y la API en la red `fruteria`. | `vol03-cap05` |
| 6 | DNS interno | PostgreSQL con su volumen y el esquema de `base-de-datos/`. La API lo encuentra por `postgres`, y la vitrina, con la compra completa, llega a la API por `api`. | `vol03-cap06` |
| 7 | Publicar puertos | Solo la vitrina publica un puerto, en `127.0.0.1`. | `vol03-cap07` |
| 8 | Otros tipos de red | Sin cambios. | `vol03-cap08` |
| 9 | Depurar redes | Sin cambios. | `vol03-cap09` |

## Volumen 4 · El plan de estiba

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | De diez comandos a un archivo | `compose.yaml` con la vitrina, la API y PostgreSQL. | `vol04-cap01` |
| 2 | Compose por dentro | Las redes `frente` y `fondo` y los volúmenes declarados. | `vol04-cap02` |
| 3 | Variables y `.env` | La clave de la base de datos en un `.env` fuera de Git. | `vol04-cap03` |
| 4 | Healthchecks | La salud de la API en `/salud/listo` y el orden de arranque. | `vol04-cap04` |
| 5 | Perfiles y overrides | Un `compose.override.yaml` para desarrollar. | `vol04-cap05` |
| 6 | Watch | Vite recarga la vitrina y Node la API al guardar. | `vol04-cap06` |
| 7 | Recetas reales | Sin cambios; las recetas de Laravel, Python y WordPress van aparte. | `vol04-cap07` |
| 8 | Réplicas y jobs | Redis, la caché del catálogo y el despachador con dos réplicas. | `vol04-cap08` |
| 9 | Dev Containers y Testcontainers | Un Dev Container y pruebas del almacén contra un PostgreSQL real. | `vol04-cap09` |

## Volumen 5 · La aduana

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | Amenazas | Sin cambios; se hace el mapa de riesgos de la tienda. | `vol05-cap01` |
| 2 | Aislamiento del kernel | `cap_drop: ALL` y `no-new-privileges` en los servicios propios. | `vol05-cap02` |
| 3 | Sin root | La vitrina pasa a nginx sin privilegios. | `vol05-cap03` |
| 4 | El socket de Docker | Sin cambios; ningún servicio monta el socket. | `vol05-cap04` |
| 5 | Imágenes base mínimas | Todas las imágenes fijadas por digest y revisadas con Hadolint. | `vol05-cap05` |
| 6 | Secretos | La clave pasa del `.env` a un secreto de Compose. | `vol05-cap06` |
| 7 | El escáner | El inventario de software (SBOM) y un informe de vulnerabilidades sin críticas. | `vol05-cap07` |
| 8 | Firma y procedencia | Las imágenes firmadas con cosign y con su procedencia. | `vol05-cap08` |
| 9 | Vallas y aforo | La red `fondo` sin internet, solo lectura, límites y aforo de pedidos en nginx. | `vol05-cap09` |
| 10 | Inspección periódica | Docker Bench sin fallas graves. Es el estado de la rama `main`. | `vol05-cap10` |

## Volumen 6 · Rumbo a producción

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | De la laptop al VPS | Sin cambios. | `vol06-cap01` |
| 2 | Preparar el servidor | Un script que prepara Ubuntu con Docker y firewall. | `vol06-cap02` |
| 3 | Proxy inverso y HTTPS | Un proxy inverso con dominio y certificado automático. | `vol06-cap03` |
| 4 | CI/CD | Un flujo de GitHub Actions que prueba, publica y despliega. | `vol06-cap04` |
| 5 | Dokploy, Coolify y Portainer | Sin cambios en el repositorio. | `vol06-cap05` |
| 6 | Despliegues sin cortes | Despliegue de la API sin cortar pedidos, con el cierre ordenado que ya tiene. | `vol06-cap06` |
| 7 | Logs, métricas y alertas | Prometheus y Grafana leen `/metricas`, con una alerta de errores. | `vol06-cap07` |
| 8 | Copias y recuperación | La copia diaria de PostgreSQL fuera del servidor. | `vol06-cap08` |
| 9 | Manual de incidentes | El manual de incidentes de la tienda. | `vol06-cap09` |
| 10 | Costos y tamaño | Los límites de memoria y CPU ajustados con mediciones reales. | `vol06-cap10` |

## Volumen 7 · La flota

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | Qué resuelve un orquestador | Sin cambios. | `vol07-cap01` |
| 2 | Swarm | Un stack de Swarm en tres nodos. | `vol07-cap02` |
| 3 | Swarm en serio | Secretos de Swarm y actualizaciones progresivas. | `vol07-cap03` |
| 4 | Swarm con Dokploy | Sin cambios en el repositorio. | `vol07-cap04` |
| 5 | Registros privados | Las imágenes en un registro privado. | `vol07-cap05` |
| 6 | Contenedores en la nube | La API probada en un servicio sin servidor propio. | `vol07-cap06` |
| 7 | Cómo elegir | Sin cambios. | `vol07-cap07` |

## Volumen 8 · El timonel

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | Qué es Kubernetes | Sin cambios. | `vol08-cap01` |
| 2 | Clúster en la laptop | La configuración del clúster local. | `vol08-cap02` |
| 3 | kubectl | El namespace `fruteria`. | `vol08-cap03` |
| 4 | Pods | La API en un Pod. | `vol08-cap04` |
| 5 | Deployments | Deployments para la vitrina, la API y el despachador. | `vol08-cap05` |
| 6 | Services | Services para cada componente. | `vol08-cap06` |
| 7 | ConfigMaps y Secrets | La configuración y la clave como objetos de Kubernetes. | `vol08-cap07` |
| 8 | Almacenamiento | PostgreSQL con su volumen persistente. | `vol08-cap08` |
| 9 | Entrar desde afuera | La vitrina accesible por Gateway API. | `vol08-cap09` |
| 10 | De Compose a manifiestos | Todos los manifiestos en `k8s/`. | `vol08-cap10` |

## Volumen 9 · La autoridad portuaria

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | Clústeres administrados | La tienda en un clúster k3s en un VPS. | `vol09-cap01` |
| 2 | Helm y Kustomize | El chart de Helm de la tienda. | `vol09-cap02` |
| 3 | Salud y recursos | `/salud/vivo` y `/salud/listo` como sondas, con recursos fijados. | `vol09-cap03` |
| 4 | Escalar solo | Autoescalado de la API. | `vol09-cap04` |
| 5 | Permisos | Una cuenta de servicio sin permisos de más. | `vol09-cap05` |
| 6 | Seguridad del clúster | Pod Security restringido y políticas de red. | `vol09-cap06` |
| 7 | Certificados y DNS | HTTPS automático dentro del clúster. | `vol09-cap07` |
| 8 | GitOps | La tienda desplegada con Argo CD. | `vol09-cap08` |
| 9 | Observabilidad | Las métricas y los logs del clúster. | `vol09-cap09` |
| 10 | Operadores | PostgreSQL administrado por un operador. | `vol09-cap10` |

## Volumen 10 · La sala de máquinas

| Cap. | Tema | La Frutería gana | Etiqueta |
| --- | --- | --- | --- |
| 1 | Contenedor a mano | La vitrina corriendo con `unshare` y `chroot`, sin Docker. | `vol10-cap01` |
| 2 | Namespaces y cgroups | Sin cambios. | `vol10-cap02` |
| 3 | Capas de verdad | Sin cambios; se abren las capas de la imagen de la API. | `vol10-cap03` |
| 4 | Estándares OCI | Sin cambios. | `vol10-cap04` |
| 5 | containerd y runc | Sin cambios. | `vol10-cap05` |
| 6 | Otras navieras | La tienda levantada con Podman. | `vol10-cap06` |
| 7 | Aislamiento fuerte | Sin cambios. | `vol10-cap07` |
| 8 | Engine API | Un script que consulta el estado de la tienda por la API del motor. | `vol10-cap08` |
| 9 | Docker e IA | Sin cambios. | `vol10-cap09` |
| 10 | Mapa del ecosistema | La auditoría final de la tienda. | `vol10-cap10` |
