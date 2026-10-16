const CLAVE_DE_DESPACHOS = 'despachos';
const CLAVE_DEL_CATALOGO = 'catalogo';
const SEGUNDOS_DEL_CATALOGO = 60;

export function crearCola(cliente) {
  return {
    async leerCatalogo() {
      const texto = await cliente.get(CLAVE_DEL_CATALOGO);
      return texto ? JSON.parse(texto) : null;
    },

    async guardarCatalogo(productos) {
      await cliente.set(CLAVE_DEL_CATALOGO, JSON.stringify(productos), { EX: SEGUNDOS_DEL_CATALOGO });
    },

    async encolarDespacho(codigo) {
      await cliente.lPush(CLAVE_DE_DESPACHOS, codigo);
    },

    async tomarDespacho(segundosDeEspera) {
      const tomado = await cliente.brPop(CLAVE_DE_DESPACHOS, segundosDeEspera);
      return tomado?.element ?? null;
    },

    async comprobar() {
      await cliente.ping();
    },
  };
}
