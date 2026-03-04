# Supervisión C.P.R.S. - App Móvil

Aplicación móvil multiplataforma (iOS/Android) para capturar información de supervisión en campo y generar automáticamente archivos PowerPoint (.pptx).

## 📱 Características

- ✅ Formulario de datos generales (fecha, hora, nombre del C.P.R.S.)
- ✅ Captura de áreas con observaciones
- ✅ Evidencia fotográfica (cámara o galería)
- ✅ Generación automática de PowerPoint
- ✅ Compartir archivos generados
- ✅ Guardado de borradores localmente
- ✅ Validación de campos obligatorios

## 🚀 Inicio Rápido

### Requisitos previos

1. **Node.js** (versión LTS recomendada)
2. **Expo Go** instalado en tu teléfono (Android/iOS)
3. **VS Code** (opcional, recomendado)

### Instalación

```bash
# Navegar al proyecto
cd supervision-cprs

# Instalar dependencias (ya instaladas)
npm install

# Iniciar la aplicación
npx expo start
```

### Ejecutar en tu teléfono

1. Ejecuta `npx expo start`
2. Escanea el código QR con:
   - **Android**: Abre Expo Go y escanea el QR
   - **iOS**: Usa la cámara para escanear y abre con Expo Go

## 📂 Estructura del Proyecto

```
supervision-cprs/
├── app/                          # Pantallas (Expo Router)
│   ├── _layout.js               # Layout principal
│   ├── index.js                 # Pantalla de inicio
│   ├── datos-generales.js       # Formulario de datos
│   ├── areas.js                 # Captura de áreas
│   └── vista-previa.js          # Vista previa y generación
├── src/
│   ├── components/              # Componentes reutilizables
│   │   ├── Button.js
│   │   ├── TextInput.js
│   │   ├── DateTimeInput.js
│   │   ├── Select.js
│   │   ├── PhotoPicker.js
│   │   └── AreaCard.js
│   ├── constants/               # Constantes y tema
│   │   ├── theme.js
│   │   └── data.js
│   ├── context/                 # Estado global
│   │   └── SupervisionContext.js
│   └── utils/                   # Utilidades
│       ├── storage.js           # Almacenamiento local
│       ├── dateUtils.js         # Formateo de fechas
│       ├── validation.js        # Validaciones
│       └── pptxGenerator.js     # Generación de PPTX
├── assets/                      # Íconos e imágenes
├── app.json                     # Configuración de Expo
├── package.json
└── README.md
```

## 🎨 Flujo de la Aplicación

### 1. Pantalla de Inicio
- Ver lista de supervisiones (borradores y finalizadas)
- Crear nueva supervisión
- Continuar supervisión existente

### 2. Datos Generales
- Fecha completa de supervisión
- Nombre del C.P.R.S.
- Fecha (día/mes)
- Hora de supervisión

### 3. Áreas y Evidencias
- Agregar áreas de supervisión
- Seleccionar área predefinida o personalizada
- Agregar observaciones o marcar "Sin novedad"
- Capturar fotos (cámara o galería)
- Reordenar áreas

### 4. Vista Previa y Generación
- Revisar resumen de datos
- Validar información
- Generar archivo PowerPoint
- Compartir o guardar archivo

## 📄 Formato del PowerPoint Generado

El archivo generado incluye:

1. **Portada**: Título, nombre del C.P.R.S., fecha y hora
2. **Información General**: Tabla con datos de la supervisión
3. **Observaciones por Área**: Lista de todas las áreas con observaciones
4. **Slides de Evidencias**: Fotos organizadas por área (4 por slide)
5. **Slide Final**: Resumen y pie de documento

### Nombre del archivo
```
Supervision_CPRS_<NombreCPRS>_<YYYY-MM-DD>.pptx
```

## 🔧 Personalización

### Áreas predefinidas
Edita el archivo `src/constants/data.js` para modificar la lista de áreas:

```javascript
export const AREAS_PREDEFINIDAS = [
  'Acceso principal',
  'Recepción',
  // Agregar más áreas...
];
```

### Colores del tema
Modifica `src/constants/theme.js` para cambiar la paleta de colores:

```javascript
export const COLORS = {
  primary: '#1e3a5f',    // Color principal
  accent: '#f4a261',     // Color de acento
  // ...
};
```

## 📦 Build para Producción

### Generar APK/AAB (Android)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Iniciar sesión en Expo
npx expo login

# Configurar EAS
eas build:configure

# Generar build para Android
eas build -p android
```

### Generar para iOS

```bash
# Requiere cuenta de Apple Developer
eas build -p ios
```

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **Expo Router** - Navegación basada en archivos
- **pptxgenjs** - Generación de PowerPoint
- **AsyncStorage** - Almacenamiento local
- **Expo Image Picker** - Captura de fotos

## 📝 JSON de Ejemplo

Estructura de datos de una supervisión:

```json
{
  "id": "uuid-generado",
  "estado": "borrador",
  "datosGenerales": {
    "fechaCompleta": "2026-02-04T10:00:00.000Z",
    "nombreCprs": "CPRS Centro",
    "fechaDiaMes": "2026-02-04T00:00:00.000Z",
    "horaSupervision": "2026-02-04T10:30:00.000Z"
  },
  "areas": [
    {
      "id": "uuid-area",
      "nombre": "Acceso principal",
      "observacion": "Se encontró señalética dañada.",
      "sinNovedad": false,
      "fotos": [
        { "uri": "file://...", "width": 1080, "height": 1920 }
      ]
    }
  ],
  "fechaCreacion": "2026-02-04T10:00:00.000Z",
  "fechaModificacion": "2026-02-04T10:30:00.000Z"
}
```

## ⚠️ Notas Importantes

1. **Permisos**: La app solicitará permisos de cámara y galería
2. **Almacenamiento**: Los borradores se guardan localmente en el dispositivo
3. **Fotos**: Se comprimen automáticamente para reducir el tamaño del PPTX
4. **Compatibilidad**: Funciona en Android 5.0+ e iOS 13+

## 📞 Soporte

Para reportar problemas o sugerir mejoras, crea un issue en el repositorio.

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026
