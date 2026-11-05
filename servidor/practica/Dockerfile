# Un Ubuntu recién alquilado, para practicar el volumen 6 sin un VPS.
FROM ubuntu:26.04@sha256:0e73b71479e7bc5f006bca872e25c3cd680dc052a0116f90d63ae363537db0dd
# Un VPS nuevo trae los paquetes del día, sin versión fija.
# hadolint ignore=DL3008
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates curl iproute2 openssh-server procps sudo ufw \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /run/sshd
CMD ["/usr/sbin/sshd", "-D", "-e"]
