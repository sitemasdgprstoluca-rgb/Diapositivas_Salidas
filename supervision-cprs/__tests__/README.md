# Testing Suite - Supervisión C.P.R.S.

## Descripción General

Este proyecto incluye una suite de pruebas completa con **182+ tests** organizados en 4 categorías principales.

## Estructura de Tests

```
__tests__/
├── __mocks__/                 # Mocks de módulos Expo
│   ├── async-storage.js
│   ├── expo-crypto.js
│   ├── expo-file-system.js
│   ├── expo-image-picker.js
│   ├── expo-print.js
│   └── expo-sharing.js
├── unit/                      # Unit Tests (87 tests)
│   ├── dateUtils.test.js      # Formateo de fechas
│   ├── validation.test.js     # Validación de datos
│   └── textAndLogic.test.js   # Sanitización y lógica de negocio
├── integration/               # Integration Tests (23 tests)
│   └── pptxGenerator.test.js  # Generación de PPTX
├── stress/                    # Stress/Fuzz Tests (32 tests)
│   └── fuzzTests.test.js      # 1000+ supervisiones aleatorias
├── golden/                    # Golden Tests (40 tests)
│   └── goldenTests.test.js    # 20 casos de regresión
└── setup.js                   # Configuración global
```

## Comandos de Ejecución

```bash
# Ejecutar todos los tests
npm test

# Tests por categoría
npm run test:unit        # Solo unit tests
npm run test:integration # Solo integration tests
npm run test:stress      # Solo stress/fuzz tests
npm run test:golden      # Solo golden tests

# Con cobertura
npm run test:coverage

# Modo watch (desarrollo)
npm run test:watch

# Para CI/CD
npm run test:ci
```

## Categorías de Tests

### 1. Unit Tests (`__tests__/unit/`)

**87 tests** que cubren funciones críticas:

- **dateUtils.test.js**: Formateo de fechas, horas, casos límite
  - Todos los meses del año
  - Años bisiestos (29 de febrero)
  - Primer/último día del año
  - Medianoche y 23:59
  - Padding de dígitos

- **validation.test.js**: Validación de datos
  - Datos generales requeridos
  - Validación de áreas
  - Supervisión completa
  - Caracteres especiales

- **textAndLogic.test.js**: Lógica de negocio
  - Sanitización de texto
  - Lógica "Sin novedad"
  - Manejo de área "Otro"
  - Manejo de fotos

### 2. Integration Tests (`__tests__/integration/`)

**23 tests** para generación de documentos:

- Estructura de datos de supervisión
- Generación de contenido por área
- Verificación de placeholders = 0
- Colores institucionales (guinda/dorado)
- Estructura de slides

### 3. Stress/Fuzz Tests (`__tests__/stress/`)

**32 tests** de resistencia:

- **1000 supervisiones aleatorias**
- Textos de 10,000+ caracteres
- 50-100 áreas por supervisión
- Caracteres especiales (emojis, unicode, árabe)
- Fechas extremas (1990-2099)
- Tests de performance (<5 segundos para 1000 supervisiones)

### 4. Golden Tests (`__tests__/golden/`)

**40 tests** de regresión con 20 fixtures predefinidos:

1. Supervisión mínima
2. Una área sin novedad
3. Una área con observaciones
4. Múltiples áreas mixtas
5. Área "Otro" con texto
6. CPRS con acentos
7. Observaciones multilínea
8. Fecha 1 de enero
9. Fecha 31 de diciembre
10. Año bisiesto (29 febrero)
11. Área con fotos
12. Penitenciaría Modelo
13. C.P.F.V. Neza Bordo
14. Observaciones 2000 caracteres
15. Todas las áreas sin novedad
16. Nombre supervisor muy largo
17. Supervisión a medianoche
18. Supervisión 23:59
19. Caracteres especiales
20. Caso típico completo

## Cobertura de Código

Los tests están configurados para exigir **70% de cobertura** en:
- Branches
- Functions
- Lines
- Statements

```bash
# Ver reporte de cobertura
npm run test:coverage

# El reporte HTML se genera en ./coverage/lcov-report/index.html
```

## CI/CD

Para pipelines de CI:

```bash
npm run test:ci
```

Esto ejecuta todos los tests con:
- Modo CI (no interactivo)
- Cobertura de código
- Reporters por defecto

## Agregar Nuevos Tests

### Unit Test
```javascript
// __tests__/unit/miModulo.test.js
describe('miModulo', () => {
  it('debe hacer algo', () => {
    expect(true).toBe(true);
  });
});
```

### Golden Test
```javascript
// Agregar nuevo fixture en goldenTests.test.js
{
  id: 'golden-21',
  nombre: 'Mi nuevo caso',
  input: {
    datosGenerales: { ... },
    areas: [ ... ],
  },
  expected: {
    esValido: true,
    numSlides: X,
  },
}
```

## Mocks Disponibles

Los siguientes módulos de Expo están mockeados:

- `expo-file-system/legacy`
- `expo-sharing`
- `expo-print`
- `expo-crypto`
- `expo-image-picker`
- `@react-native-async-storage/async-storage`

## Performance

Tiempos típicos de ejecución:
- Unit tests: ~1s
- Integration tests: ~0.5s
- Stress tests: ~1s (incluye 1000 supervisiones)
- Golden tests: ~0.3s
- **Total: ~2.5s**
