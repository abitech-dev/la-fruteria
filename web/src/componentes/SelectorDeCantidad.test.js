import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import SelectorDeCantidad from './SelectorDeCantidad.vue';

const montar = (cantidad) => mount(SelectorDeCantidad, { props: { nombre: 'Palta Hass (kilo)', cantidad } });

describe('SelectorDeCantidad', () => {
  it('muestra la cantidad con el nombre del producto para el lector de pantalla', () => {
    const selector = montar(3);
    expect(selector.get('output').text()).toBe('3');
    expect(selector.get('[role="group"]').attributes('aria-label')).toBe('Cantidad de Palta Hass (kilo)');
  });

  it('avisa cuánto cambiar con cada botón', async () => {
    const selector = montar(3);
    await selector.get('[aria-label="Quitar uno"]').trigger('click');
    await selector.get('[aria-label="Agregar uno"]').trigger('click');
    expect(selector.emitted('cambiar')).toEqual([[-1], [1]]);
  });

  it('con una sola unidad, el botón de restar dice que la quita del pedido', () => {
    expect(montar(1).find('[aria-label="Quitar del pedido"]').exists()).toBe(true);
  });

  it('no deja agregar más allá del máximo', () => {
    expect(montar(99).get('[aria-label="Agregar uno"]').attributes('disabled')).toBeDefined();
  });
});
