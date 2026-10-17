variable "PREFIJO" {
  default = "la-fruteria"
}

group "default" {
  targets = ["web", "api"]
}

target "plataformas" {
  platforms = ["linux/amd64", "linux/arm64"]
}

target "web" {
  inherits = ["plataformas"]
  context  = "web"
  tags     = ["${PREFIJO}-web"]
}

target "api" {
  inherits = ["plataformas"]
  context  = "api"
  tags     = ["${PREFIJO}-api"]
}
