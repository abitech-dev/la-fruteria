variable "PREFIJO" {
  default = "la-fruteria"
}

group "default" {
  targets = ["web", "api"]
}

target "plataformas" {
  platforms = ["linux/amd64", "linux/arm64"]
}

# Cada imagen sale con su procedencia y su inventario de software.
target "precinto" {
  attest = ["type=provenance,mode=max", "type=sbom"]
}

target "web" {
  inherits = ["plataformas", "precinto"]
  context  = "web"
  tags     = ["${PREFIJO}-web"]
}

target "api" {
  inherits = ["plataformas", "precinto"]
  context  = "api"
  tags     = ["${PREFIJO}-api"]
}
