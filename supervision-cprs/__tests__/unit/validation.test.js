/**
 * Unit Tests - Validation
 * Tests para validarDatosGenerales y validarSupervisionCompleta
 */

const {
  validarDatosGenerales,
  validarSupervisionCompleta,
  validarArea,
} = require('../../src/utils/validation');

describe('validation', () => {
  describe('validarDatosGenerales', () => {
    const datosValidos = {
      nombreCprs: 'C.P.R.S. Toluca',
      fechaHoraSupervision: '2026-02-04T10:30:00.000Z',
      nombreSupervisor: 'Juan Pérez',
      cargoSupervisor: 'Director',
    };

    it('debe validar datos completos', () => {
      const resultado = validarDatosGenerales(datosValidos);
      expect(resultado.isValid).toBe(true);
      expect(Object.keys(resultado.errores)).toHaveLength(0);
    });

    it('debe detectar fechaHoraSupervision faltante', () => {
      const datos = { ...datosValidos, fechaHoraSupervision: null };
      const resultado = validarDatosGenerales(datos);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.fechaHoraSupervision).toBeDefined();
    });

    it('debe detectar fechaHoraSupervision como string vacío', () => {
      const datos = { ...datosValidos, fechaHoraSupervision: '' };
      const resultado = validarDatosGenerales(datos);
      expect(resultado.isValid).toBe(false);
    });

    it('debe detectar nombreCprs faltante', () => {
      const datos = { ...datosValidos, nombreCprs: '' };
      const resultado = validarDatosGenerales(datos);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.nombreCprs).toBeDefined();
    });

    it('debe detectar nombreCprs como null', () => {
      const datos = { ...datosValidos, nombreCprs: null };
      const resultado = validarDatosGenerales(datos);
      expect(resultado.isValid).toBe(false);
    });

    it('debe detectar nombreCprs con solo espacios', () => {
      const datos = { ...datosValidos, nombreCprs: '   ' };
      const resultado = validarDatosGenerales(datos);
      expect(resultado.isValid).toBe(false);
    });

    it('debe detectar múltiples errores', () => {
      const datos = {
        nombreCprs: '',
        fechaHoraSupervision: null,
        nombreSupervisor: '',
        cargoSupervisor: '',
      };
      const resultado = validarDatosGenerales(datos);
      expect(resultado.isValid).toBe(false);
      expect(Object.keys(resultado.errores).length).toBeGreaterThanOrEqual(2);
    });

    it('debe aceptar caracteres especiales en nombres', () => {
      const datos = {
        ...datosValidos,
        nombreCprs: 'C.P.R.S. Peñón del Marqués - Ñoño',
        nombreSupervisor: 'José María García Pérez',
      };
      const resultado = validarDatosGenerales(datos);
      expect(resultado.isValid).toBe(true);
    });

    it('debe aceptar fecha como objeto Date', () => {
      const datos = {
        ...datosValidos,
        fechaHoraSupervision: new Date('2026-02-04T10:30:00'),
      };
      const resultado = validarDatosGenerales(datos);
      expect(resultado.isValid).toBe(true);
    });
  });

  describe('validarArea', () => {
    it('debe validar área sin novedad', () => {
      const area = {
        nombre: 'Cocina',
        sinNovedad: true,
        observacion: '',
      };
      const resultado = validarArea(area);
      expect(resultado.isValid).toBe(true);
    });

    it('debe validar área con observación', () => {
      const area = {
        nombre: 'Dormitorios',
        sinNovedad: false,
        observacion: 'Hay un problema detectado.',
      };
      const resultado = validarArea(area);
      expect(resultado.isValid).toBe(true);
    });

    it('debe detectar nombre vacío', () => {
      const area = {
        nombre: '',
        sinNovedad: true,
      };
      const resultado = validarArea(area);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.nombre).toBeDefined();
    });

    it('debe requerir observación cuando no es sin novedad', () => {
      const area = {
        nombre: 'Cocina',
        sinNovedad: false,
        observacion: '',
      };
      const resultado = validarArea(area);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errores.observacion).toBeDefined();
    });
  });

  describe('validarSupervisionCompleta', () => {
    const supervisionValida = {
      id: '123',
      datosGenerales: {
        nombreCprs: 'C.P.R.S. Toluca',
        fechaHoraSupervision: '2026-02-04T10:30:00.000Z',
        nombreSupervisor: 'Juan Pérez',
        cargoSupervisor: 'Director',
      },
      areas: [],
    };

    it('debe validar supervisión completa', () => {
      const resultado = validarSupervisionCompleta(supervisionValida);
      expect(resultado.isValid).toBe(true);
    });

    it('debe dar advertencia cuando no hay áreas', () => {
      const resultado = validarSupervisionCompleta(supervisionValida);
      expect(resultado.advertencias.length).toBeGreaterThan(0);
    });

    it('debe poder generar aunque tenga advertencias', () => {
      const resultado = validarSupervisionCompleta(supervisionValida);
      expect(resultado.puedeGenerar).toBe(true);
    });

    it('debe detectar datosGenerales inválidos', () => {
      const supervision = {
        ...supervisionValida,
        datosGenerales: {
          nombreCprs: '',
          fechaHoraSupervision: null,
        },
      };
      const resultado = validarSupervisionCompleta(supervision);
      expect(resultado.isValid).toBe(false);
    });

    it('debe validar supervisión con múltiples áreas', () => {
      const supervision = {
        ...supervisionValida,
        areas: [
          { id: '1', nombre: 'Área 1', sinNovedad: true },
          { id: '2', nombre: 'Área 2', sinNovedad: false, observacion: 'Test' },
          { id: '3', nombre: 'Área 3', sinNovedad: true },
        ],
      };
      const resultado = validarSupervisionCompleta(supervision);
      expect(resultado.isValid).toBe(true);
    });

    it('debe manejar áreas con fotos', () => {
      const supervision = {
        ...supervisionValida,
        areas: [
          {
            id: '1',
            nombre: 'Área 1',
            sinNovedad: false,
            observacion: 'Hay observaciones',
            fotos: [
              { uri: 'file://foto1.jpg' },
              { uri: 'file://foto2.jpg' },
            ],
          },
        ],
      };
      const resultado = validarSupervisionCompleta(supervision);
      expect(resultado.isValid).toBe(true);
    });
  });
});
