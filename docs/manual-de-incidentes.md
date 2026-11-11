# Manual de incidentes

Para quien atiende la tienda cuando falla. Fija qué mirar y en qué orden, cómo detener el daño sin borrar las pistas y cómo escribir el informe.

Todas las órdenes se corren en el servidor, dentro de la carpeta `la-fruteria`.

## Antes de tocar nada

1. Anota la hora en que empezó y quién avisó.
2. Guarda la bitácora de toda la tienda, antes de reiniciar o recrear cualquier caja.

   ```bash
   sudo docker compose logs --timestamps > "incidente-$(date +%F-%H%M).log"
   ```

3. Nunca corras `docker compose down` para empezar de cero. Borra las cajas y, con ellas, su bitácora.

## El orden de revisión

1. Mira lo que nota el cliente.

   ```bash
   curl -sk -o /dev/null -w "%{http_code}\n" https://lafruteria.example/api/productos
   ```

2. Mira el estado y la salud de cada caja. Busca `unhealthy`, `restarting` o una caja que falta.

   ```bash
   sudo docker compose ps --all
   ```

3. Lee la bitácora de la caja que falla, desde que empezó el problema.

   ```bash
   sudo docker compose logs --since 30m api
   ```

4. Pregúntale a Docker cómo terminó la caja, cuántas veces se reinició y si la mató el límite de memoria.

   ```bash
   sudo docker inspect --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}} {{.RestartCount}}' la-fruteria-api-1
   ```

5. Mira cuánto consume cada caja frente a su tope.

   ```bash
   sudo docker stats --no-stream
   ```

6. Mira el disco del servidor y lo que ocupa Docker.

   ```bash
   df -h /
   sudo docker system df
   ```

7. Revisa si hubo un despliegue reciente. La versión en marcha está en `.env`, y el historial, en Git.

   ```bash
   grep VERSION .env
   git log --oneline -3
   ```

## Cuatro incidentes conocidos

| Lo que ves | Lo que pasa | Qué hacer |
| --- | --- | --- |
| La API se reinicia sola, y `docker inspect` dice `OOMKilled` en `true` | La API pasó su tope de memoria y el núcleo la cortó | Vuelve al tope de `compose.yaml` o súbelo con mediciones, como en el capítulo 10 |
| La API aparece `unhealthy`, y su bitácora dice `no está lista` | PostgreSQL o Redis no responden | Mira la bitácora de PostgreSQL y arráncalo con `sudo docker compose start postgres` |
| Los pedidos fallan con 500 justo después de un despliegue | La versión nueva trae un error | Vuelve a la versión anterior, abajo |
| `df -h` muestra el disco lleno, y un archivo `-json.log` pesa gigas | Una caja sin tope de bitácora | Ponle tope en su archivo de Compose y recréala |

## Volver a la versión anterior

1. Busca la versión anterior, la que funcionaba, en el historial de despliegues de GitHub o en `git log`.
2. Cámbiala en `.env` y despliega sin cortes.

   ```bash
   sed -i "s/^VERSION=.*/VERSION=<la versión anterior>/" .env
   sudo docker compose pull -q
   sudo docker rollout web
   sudo docker rollout api
   sudo docker compose up -d --wait
   ```

3. Comprueba que los pedidos vuelven a entrar, y después busca la causa con calma.

## El informe del incidente

Se escribe en los dos días siguientes, sin culpables. Cuenta lo que pasó y qué cambia en el sistema para que no se repita, no quién se equivocó.

```markdown
# Incidente del <fecha>

## Resumen
<qué notó el cliente, cuánto duró y cuántos pedidos afectó>

## Línea de tiempo
<hora> <qué pasó o qué se hizo>

## Causa
<qué falló en el sistema, y por qué las defensas no lo atajaron>

## Qué salió bien

## Qué cambiamos
- [ ] <acción concreta, con responsable y fecha>
```

## Problemas frecuentes

| Problema | Solución |
| --- | --- |
| `docker compose logs` no muestra nada de antes del reinicio | Alguien recreó la caja. Usa el archivo `incidente-*.log`, si lo guardaste |
| `docker rollout` dice `New containers are not healthy. Rolling back.` | La versión que pediste no arranca. La anterior sigue atendiendo; revisa su bitácora |
