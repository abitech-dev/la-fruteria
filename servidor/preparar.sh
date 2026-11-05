#!/usr/bin/env bash
# Prepara un Ubuntu 26.04 recién alquilado para La Frutería.
# Se corre como root, con el nombre del usuario nuevo.
set -euo pipefail

usuario="${1:?Falta el usuario, como en: bash preparar.sh tienda}"
interfaz="$(ip -o route show default | awk '{print $5; exit}')"
export DEBIAN_FRONTEND=noninteractive

echo "1/6 El usuario $usuario, con sudo y la clave de root"
id "$usuario" >/dev/null 2>&1 \
  || adduser --disabled-password --comment "" "$usuario" >/dev/null
usermod -aG sudo "$usuario"
# Sin contraseña, sudo no tiene qué pedir. La llave es la clave SSH.
echo "$usuario ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/90-$usuario"
chmod 440 "/etc/sudoers.d/90-$usuario"
install -d -m 700 -o "$usuario" -g "$usuario" "/home/$usuario/.ssh"
install -m 600 -o "$usuario" -g "$usuario" \
  /root/.ssh/authorized_keys "/home/$usuario/.ssh/"

echo "2/6 SSH solo con clave, y sin root"
cat > /etc/ssh/sshd_config.d/10-fruteria.conf <<'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
CONF
sshd -t
systemctl restart ssh.service

echo "3/6 Docker Engine, desde el repositorio de Docker"
apt-get update -qq
apt-get install -y -qq ca-certificates curl >/dev/null
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
# shellcheck source=/dev/null
. /etc/os-release
cat > /etc/apt/sources.list.d/docker.sources <<CONF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: ${UBUNTU_CODENAME:-$VERSION_CODENAME}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
CONF
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin >/dev/null

echo "4/6 El cortafuegos, con 22, 80 y 443, también para las cajas"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
# Docker desvía el tráfico de sus cajas antes de las reglas de UFW.
# DOCKER-USER es la cadena que Docker revisa antes de dejarlo pasar.
grep -q "DOCKER-USER" /etc/ufw/after.rules || cat >> /etc/ufw/after.rules <<CONF

*filter
:DOCKER-USER - [0:0]
-A DOCKER-USER -m conntrack --ctstate ESTABLISHED,RELATED -j RETURN
-A DOCKER-USER -i $interfaz -p tcp -m conntrack --ctorigdstport 80 -j RETURN
-A DOCKER-USER -i $interfaz -p tcp -m conntrack --ctorigdstport 443 -j RETURN
-A DOCKER-USER -i $interfaz -j DROP
COMMIT
CONF
ufw --force enable >/dev/null
ufw reload >/dev/null

echo "5/6 Las actualizaciones de seguridad automáticas"
apt-get install -y -qq unattended-upgrades >/dev/null

echo "6/6 docker-rollout, para desplegar sin cortes"
# El resumen es el que publica la versión v0.14 en GitHub.
rollout="https://github.com/wowu/docker-rollout/releases/download/v0.14/docker-rollout"
curl -fsSL "$rollout" -o /tmp/docker-rollout
echo "cdeaba6ae9eee3b0b606286e585bbda6787283d801a6ad6d9b9d2bc347fda05b  /tmp/docker-rollout" \
  | sha256sum -c --quiet
install -D -m 755 /tmp/docker-rollout /usr/local/lib/docker/cli-plugins/docker-rollout

echo "Listo. Entra como $usuario antes de cerrar esta sesión."
