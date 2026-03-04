/**
 * Unit Tests - Date Utilities
 * Tests para formateo de fechas, horas y edge cases
 */

// Mock del módulo data para MESES
jest.mock('../../src/constants/data', () => ({
  MESES: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ],
}));

const {
  formatearFechaCompleta,
  formatearFechaDiaMes,
  formatearHora,
  formatearFechaArchivo,
  generarNombreArchivo,
  formatearFechaDisplay,
} = require('../../src/utils/dateUtils');

describe('dateUtils', () => {
  describe('formatearFechaCompleta', () => {
    it('debe formatear fecha correctamente', () => {
      const fecha = new Date('2026-02-04T10:30:00');
      expect(formatearFechaCompleta(fecha)).toBe('04 de febrero de 2026');
    });

    it('debe manejar string ISO', () => {
      const fecha = '2026-12-25T15:00:00.000Z';
      expect(formatearFechaCompleta(fecha)).toContain('diciembre');
      expect(formatearFechaCompleta(fecha)).toContain('2026');
    });

    it('debe manejar día con un solo dígito', () => {
      const fecha = new Date('2026-01-05T10:00:00');
      expect(formatearFechaCompleta(fecha)).toBe('05 de enero de 2026');
    });

    it('debe retornar string vacío para fecha null', () => {
      expect(formatearFechaCompleta(null)).toBe('');
    });

    it('debe retornar string vacío para fecha undefined', () => {
      expect(formatearFechaCompleta(undefined)).toBe('');
    });

    it('debe retornar string vacío para string vacío', () => {
      expect(formatearFechaCompleta('')).toBe('');
    });

    it('debe manejar todos los meses correctamente', () => {
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      ];
      
      for (let i = 0; i < 12; i++) {
        const fecha = new Date(2026, i, 15);
        const resultado = formatearFechaCompleta(fecha);
        expect(resultado).toContain(meses[i]);
      }
    });

    it('debe manejar años bisiestos (29 de febrero)', () => {
      const fecha = new Date('2024-02-29T12:00:00');
      expect(formatearFechaCompleta(fecha)).toBe('29 de febrero de 2024');
    });

    it('debe manejar primer día del año', () => {
      const fecha = new Date('2026-01-01T00:00:00');
      expect(formatearFechaCompleta(fecha)).toBe('01 de enero de 2026');
    });

    it('debe manejar último día del año', () => {
      const fecha = new Date('2026-12-31T23:59:59');
      expect(formatearFechaCompleta(fecha)).toBe('31 de diciembre de 2026');
    });
  });

  describe('formatearFechaDiaMes', () => {
    it('debe formatear día y mes correctamente', () => {
      const fecha = new Date('2026-03-15T10:00:00');
      expect(formatearFechaDiaMes(fecha)).toBe('15 de marzo');
    });

    it('debe manejar día con un dígito con padding', () => {
      const fecha = new Date('2026-07-01T10:00:00');
      expect(formatearFechaDiaMes(fecha)).toBe('01 de julio');
    });

    it('debe retornar string vacío para null', () => {
      expect(formatearFechaDiaMes(null)).toBe('');
    });

    it('debe manejar string ISO', () => {
      const fecha = '2026-09-22T14:00:00.000Z';
      expect(formatearFechaDiaMes(fecha)).toContain('septiembre');
    });
  });

  describe('formatearHora', () => {
    it('debe formatear hora correctamente', () => {
      const fecha = new Date('2026-02-04T14:30:00');
      expect(formatearHora(fecha)).toBe('14:30');
    });

    it('debe manejar hora con un dígito con padding', () => {
      const fecha = new Date('2026-02-04T09:05:00');
      expect(formatearHora(fecha)).toBe('09:05');
    });

    it('debe manejar medianoche', () => {
      const fecha = new Date('2026-02-04T00:00:00');
      expect(formatearHora(fecha)).toBe('00:00');
    });

    it('debe manejar 23:59', () => {
      const fecha = new Date('2026-02-04T23:59:00');
      expect(formatearHora(fecha)).toBe('23:59');
    });

    it('debe retornar string vacío para null', () => {
      expect(formatearHora(null)).toBe('');
    });

    it('debe manejar string ISO', () => {
      const fecha = '2026-02-04T16:45:00.000Z';
      const resultado = formatearHora(fecha);
      expect(resultado).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('formatearFechaArchivo', () => {
    it('debe formatear para nombre de archivo (YYYY-MM-DD)', () => {
      const fecha = new Date('2026-02-04T10:00:00');
      expect(formatearFechaArchivo(fecha)).toBe('2026-02-04');
    });

    it('debe manejar meses y días con un dígito', () => {
      const fecha = new Date('2026-01-05T10:00:00');
      expect(formatearFechaArchivo(fecha)).toBe('2026-01-05');
    });

    it('debe retornar string vacío para null', () => {
      expect(formatearFechaArchivo(null)).toBe('');
    });
  });

  describe('generarNombreArchivo', () => {
    it('debe generar nombre de archivo válido', () => {
      const fecha = new Date('2026-02-04T10:00:00');
      const nombre = generarNombreArchivo('CPRS Toluca', fecha);
      expect(nombre).toBe('Supervision_CPRS_CPRS_Toluca_2026-02-04.pptx');
    });

    it('debe sanitizar caracteres especiales', () => {
      const fecha = new Date('2026-02-04T10:00:00');
      const nombre = generarNombreArchivo('CPRS <Test> / Área', fecha);
      expect(nombre).not.toContain('<');
      expect(nombre).not.toContain('>');
      expect(nombre).not.toContain('/');
    });

    it('debe reemplazar espacios múltiples con underscore', () => {
      const fecha = new Date('2026-02-04T10:00:00');
      const nombre = generarNombreArchivo('CPRS   Múltiples   Espacios', fecha);
      expect(nombre).not.toContain('  ');
      expect(nombre).toContain('_');
    });

    it('debe manejar caracteres especiales del español', () => {
      const fecha = new Date('2026-02-04T10:00:00');
      const nombre = generarNombreArchivo('Peñón Ñoño Árbol', fecha);
      expect(nombre).toContain('Peñón');
      expect(nombre).toContain('Ñoño');
      expect(nombre).toContain('Árbol');
    });

    it('debe terminar con .pptx', () => {
      const fecha = new Date('2026-02-04T10:00:00');
      const nombre = generarNombreArchivo('Test', fecha);
      expect(nombre).toMatch(/\.pptx$/);
    });
  });

  describe('formatearFechaDisplay', () => {
    it('debe formatear para display (DD/MM/YYYY HH:MM)', () => {
      const fecha = '2026-02-04T14:30:00.000Z';
      const resultado = formatearFechaDisplay(fecha);
      expect(resultado).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    });

    it('debe retornar string vacío para null', () => {
      expect(formatearFechaDisplay(null)).toBe('');
    });

    it('debe retornar string vacío para undefined', () => {
      expect(formatearFechaDisplay(undefined)).toBe('');
    });

    it('debe retornar string vacío para string vacío', () => {
      expect(formatearFechaDisplay('')).toBe('');
    });
  });
});
