/**
 * Unit Tests - Validation (modelo de RUBROS con calificación y criterios).
 */

const {
  validarDatosGenerales,
  validarSupervisionCompleta,
  validarRubro,
  validarArea,
} = require('../../src/utils/validation');

describe('validation', () => {
  describe('validarDatosGenerales', () => {
    const datosValidos = {
      nombreCprs: 'C.P.R.S. Toluca',
      fechaHoraSupervision: '2026-02-04T10:30:00.000Z',
    };

    it('debe validar datos completos', () => {
      const resultado = validarDatosGenerales(datosValidos);
      expect(resultado.isValid).toBe(true);
    });

    it('debe detectar fechaHoraSupervision faltante', () => {
      const resultado = validarDatosGenerales({ ...datosValidos, fechaHoraSupervision: null });
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.fechaHoraSupervision).toBeDefined();
    });

    it('debe detectar nombreCprs faltante', () => {
      const resultado = validarDatosGenerales({ ...datosValidos, nombreCprs: '' });
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.nombreCprs).toBeDefined();
    });

    it('debe detectar nombreCprs con solo espacios', () => {
      const resultado = validarDatosGenerales({ ...datosValidos, nombreCprs: '   ' });
      expect(resultado.isValid).toBe(false);
    });

    it('debe aceptar caracteres especiales', () => {
      const resultado = validarDatosGenerales({
        ...datosValidos,
        nombreCprs: 'C.P.R.S. Peñón del Marqués - Ñoño',
      });
      expect(resultado.isValid).toBe(true);
    });
  });

  describe('validarRubro', () => {
    const rubroValido = {
      nombre: 'Armería',
      noAplica: false,
      calificacion: 8,
      criterios: [
        { id: 'arm-1', texto: 'criterio 1', cumple: true },
        { id: 'arm-2', texto: 'criterio 2', cumple: false },
      ],
      sinNovedad: false,
      observacion: 'Todo en orden con observaciones menores.',
      fotos: [{ uri: 'file://foto.jpg' }],
    };

    it('debe validar rubro completo', () => {
      const resultado = validarRubro(rubroValido);
      expect(resultado.isValid).toBe(true);
    });

    it('debe aceptar rubro con "No aplica"', () => {
      const rubro = { ...rubroValido, noAplica: true, calificacion: null, criterios: [], fotos: [] };
      const resultado = validarRubro(rubro);
      expect(resultado.isValid).toBe(true);
    });

    it('debe detectar calificación faltante', () => {
      const resultado = validarRubro({ ...rubroValido, calificacion: null });
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.calificacion).toBeDefined();
    });

    it('debe detectar calificación fuera de rango', () => {
      expect(validarRubro({ ...rubroValido, calificacion: 0 }).isValid).toBe(false);
      expect(validarRubro({ ...rubroValido, calificacion: 11 }).isValid).toBe(false);
      expect(validarRubro({ ...rubroValido, calificacion: 5.5 }).isValid).toBe(false);
    });

    it('debe aceptar todas las calificaciones enteras 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        expect(validarRubro({ ...rubroValido, calificacion: i }).isValid).toBe(true);
      }
    });

    it('debe detectar criterios sin responder', () => {
      const rubro = {
        ...rubroValido,
        criterios: [
          { id: 'a', texto: 'c', cumple: true },
          { id: 'b', texto: 'c2', cumple: null },
        ],
      };
      const resultado = validarRubro(rubro);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.criterios).toBeDefined();
    });

    it('debe aceptar rubros sin criterios definidos', () => {
      const rubro = { ...rubroValido, criterios: [] };
      expect(validarRubro(rubro).isValid).toBe(true);
    });

    it('debe requerir observación cuando no es sin novedad', () => {
      const resultado = validarRubro({ ...rubroValido, sinNovedad: false, observacion: '' });
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.observacion).toBeDefined();
    });

    it('debe aceptar sin novedad sin observación', () => {
      const resultado = validarRubro({ ...rubroValido, sinNovedad: true, observacion: '' });
      expect(resultado.isValid).toBe(true);
    });

    it('debe requerir al menos una foto', () => {
      const resultado = validarRubro({ ...rubroValido, fotos: [] });
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.fotos).toBeDefined();
    });

    it('validarArea debe ser alias de validarRubro', () => {
      expect(validarArea).toBe(validarRubro);
    });
  });

  describe('validarSupervisionCompleta', () => {
    const rubroOK = {
      id: 'r1',
      nombre: 'Armería',
      noAplica: false,
      calificacion: 8,
      criterios: [{ id: 'a', texto: 't', cumple: true }],
      sinNovedad: false,
      observacion: 'observación de prueba',
      fotos: [{ uri: 'file://foto.jpg' }],
    };

    const supervisionValida = {
      id: '123',
      datosGenerales: {
        nombreCprs: 'C.P.R.S. Toluca',
        fechaHoraSupervision: '2026-02-04T10:30:00.000Z',
      },
      areas: [rubroOK],
    };

    it('debe validar supervisión completa', () => {
      const resultado = validarSupervisionCompleta(supervisionValida);
      expect(resultado.isValid).toBe(true);
    });

    it('debe marcar error cuando no hay rubros', () => {
      const resultado = validarSupervisionCompleta({ ...supervisionValida, areas: [] });
      expect(resultado.isValid).toBe(false);
    });

    it('debe detectar datosGenerales inválidos', () => {
      const resultado = validarSupervisionCompleta({
        ...supervisionValida,
        datosGenerales: { nombreCprs: '', fechaHoraSupervision: null },
      });
      expect(resultado.isValid).toBe(false);
    });

    it('debe validar múltiples rubros y reportar errores por rubro', () => {
      const resultado = validarSupervisionCompleta({
        ...supervisionValida,
        areas: [
          rubroOK,
          { ...rubroOK, calificacion: null, nombre: 'Cocina' },
        ],
      });
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.some((e) => e.includes('Cocina'))).toBe(true);
    });

    it('debe advertir cuando todos los rubros son No aplica', () => {
      const resultado = validarSupervisionCompleta({
        ...supervisionValida,
        areas: [
          { ...rubroOK, noAplica: true, calificacion: null, criterios: [], fotos: [] },
        ],
      });
      expect(resultado.isValid).toBe(true);
      expect(resultado.advertencias.length).toBeGreaterThan(0);
    });
  });
});
