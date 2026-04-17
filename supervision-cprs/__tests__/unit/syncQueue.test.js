/**
 * Unit tests - syncQueue
 * Usa el mock de AsyncStorage (in-memory) de __mocks__/async-storage.js
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');
const {
  obtenerCola,
  encolarSupervision,
  removerDeCola,
  marcarFallido,
  contarPendientes,
  limpiarCola,
} = require('../../src/utils/syncQueue');

describe('syncQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('cola vacía al inicio', async () => {
    expect(await obtenerCola()).toEqual([]);
    expect(await contarPendientes()).toBe(0);
  });

  it('encolar agrega una supervisión', async () => {
    await encolarSupervision('sup-1', { subirFotos: false });
    const cola = await obtenerCola();
    expect(cola).toHaveLength(1);
    expect(cola[0].supervisionId).toBe('sup-1');
    expect(cola[0].subirFotos).toBe(false);
    expect(cola[0].intentos).toBe(0);
  });

  it('encolar twice actualiza en lugar de duplicar', async () => {
    await encolarSupervision('sup-1', { subirFotos: false });
    await encolarSupervision('sup-1', { subirFotos: true });
    const cola = await obtenerCola();
    expect(cola).toHaveLength(1);
    expect(cola[0].subirFotos).toBe(true); // upgrade persisting
  });

  it('encolar preserva subirFotos=true aunque el segundo sea false', async () => {
    await encolarSupervision('sup-1', { subirFotos: true });
    await encolarSupervision('sup-1', { subirFotos: false });
    const cola = await obtenerCola();
    expect(cola[0].subirFotos).toBe(true);
  });

  it('encolar resetea intentos cuando reencola', async () => {
    await encolarSupervision('sup-1');
    await marcarFallido('sup-1', 'error1');
    await marcarFallido('sup-1', 'error2');
    let cola = await obtenerCola();
    expect(cola[0].intentos).toBe(2);

    await encolarSupervision('sup-1');
    cola = await obtenerCola();
    expect(cola[0].intentos).toBe(0);
    expect(cola[0].ultimoError).toBeUndefined();
  });

  it('removerDeCola quita el item', async () => {
    await encolarSupervision('sup-1');
    await encolarSupervision('sup-2');
    await removerDeCola('sup-1');
    const cola = await obtenerCola();
    expect(cola).toHaveLength(1);
    expect(cola[0].supervisionId).toBe('sup-2');
  });

  it('removerDeCola es idempotente', async () => {
    await encolarSupervision('sup-1');
    await removerDeCola('sup-1');
    await removerDeCola('sup-1'); // segundo intento
    expect(await contarPendientes()).toBe(0);
  });

  it('marcarFallido incrementa intentos y guarda error', async () => {
    await encolarSupervision('sup-1');
    await marcarFallido('sup-1', 'sin red');
    await marcarFallido('sup-1', 'timeout');
    const cola = await obtenerCola();
    expect(cola[0].intentos).toBe(2);
    expect(cola[0].ultimoError).toBe('timeout');
  });

  it('marcarFallido en supervisión inexistente no rompe', async () => {
    await marcarFallido('sup-fantasma', 'x');
    expect(await contarPendientes()).toBe(0);
  });

  it('contarPendientes refleja la cantidad real', async () => {
    expect(await contarPendientes()).toBe(0);
    await encolarSupervision('sup-1');
    await encolarSupervision('sup-2');
    await encolarSupervision('sup-3');
    expect(await contarPendientes()).toBe(3);
    await removerDeCola('sup-2');
    expect(await contarPendientes()).toBe(2);
  });

  it('limpiarCola borra todo', async () => {
    await encolarSupervision('sup-1');
    await encolarSupervision('sup-2');
    await limpiarCola();
    expect(await contarPendientes()).toBe(0);
  });

  it('persiste correctamente entre llamadas (simula cierre de app)', async () => {
    await encolarSupervision('sup-1', { subirFotos: true });
    await marcarFallido('sup-1', 'network');
    // "reabrir" la app es solo otra llamada a obtenerCola
    const cola = await obtenerCola();
    expect(cola).toHaveLength(1);
    expect(cola[0].supervisionId).toBe('sup-1');
    expect(cola[0].subirFotos).toBe(true);
    expect(cola[0].intentos).toBe(1);
    expect(cola[0].ultimoError).toBe('network');
  });

  it('maneja JSON corrupto en AsyncStorage devolviendo []', async () => {
    await AsyncStorage.setItem('@sync_queue', 'no-es-json{{{');
    const cola = await obtenerCola();
    expect(cola).toEqual([]);
  });
});
