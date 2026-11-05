# Un Ubuntu recién alquilado, para practicar sin un VPS.
FROM ubuntu:26.04@sha256:0e73b71479e7bc5f006bca872e25c3cd680dc052a0116f90d63ae363537db0dd
ARG DEBIAN_FRONTEND=noninteractive
# Sin versiones fijas, como un VPS recién entregado.
# hadolint ignore=DL3008
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates curl iproute2 openssh-server \
      procps sudo systemd systemd-sysv ufw \
 && rm -rf /var/lib/apt/lists/* /usr/sbin/policy-rc.d \
 && systemctl mask getty@tty1.service \
      systemd-modules-load.service
# systemd se apaga en orden con esta señal.
STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
