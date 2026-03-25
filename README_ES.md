# 🎥 Vigilancia Frontend - Sistema de Monitoreo Inteligente

Frontend interactivo para un sistema de vigilancia basado en IA que proporciona monitoreo en tiempo real, detección de delitos y análisis de registros históricos.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Cómo Usar](#cómo-usar)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Características Detalladas](#características-detalladas)
- [Configuración Local](#configuración-local)
- [Desarrollo](#desarrollo)
- [Compilación para Producción](#compilación-para-producción)

## ✨ Características

### 🎬 Monitoreo en Vivo
- **Grid de Cámaras Dinámico**: Visualiza múltiples cámaras de vigilancia en una cuadrícula responsiva
- **Reposicionamiento de Cámaras**: Arrastra y suelta las cámaras para reorganizar su disposición en el panel
- **Estados en Tiempo Real**: Monitorea el estado de cada cámara (online, offline, warning)
- **Indicadores de Alerta**: Visualización clara de alertas activas en cada cámara
- **Métricas del Sistema**: Panel de métricas en tiempo real mostrando:
  - Total de cámaras activas
  - Alertas del día
  - Latencia promedio
  - Precisión del modelo
  - Uptime del sistema
  - FPS de procesamiento

### 🚨 Panel de Alertas Activas
- **Lista Desplazable**: Scroll automático para ver todas las alertas activas
- **Alertas Agrupadas**: Seguimiento multi-cámara con alertas relacionadas
- **Clasificación por Severidad**: 
  - 🔴 Crítica (Amenaza armada)
  - 🔴 Alta (Robo, Agresión)
  - 🟠 Media (Vandalismo, Intrusión)
  - 🟡 Baja (Actividad sospechosa)
- **Información Detallada**:
  - Tipo de delito detectado
  - Confianza de la detección
  - Ubicación y cámara
  - Tiempo relativo
  - Cantidad de cámaras relacionadas
  - Estado de perifoneo (PA)

### 📊 Registros Históricos
- **Filtrado Avanzado**:
  - Búsqueda por cámara, ubicación o ID
  - Filtrado múltiple por tipo de delito
  - Filtrado múltiple por estado de validación
  - Filtrado por rango de fecha
  - Eliminación individual de filtros
- **Vista de Tabla**:
  - Información completa de cada registro
  - Detalles de validación
  - Puntuación de confianza
- **Exportación**:
  - Exportar todos los resultados filtrados a Excel
  - Exportar registros individuales en formato ZIP
- **Modal de Detalles**:
  - Visualización completa de evidencia
  - Historial de validación
  - Alertas relacionadas


## 📦 Requisitos Previos

Asegúrate de tener instalado en tu equipo:

- **Node.js**: v18.0.0 o superior
- **npm** o **bun**: Gestor de paquetes
- **Git**: Para clonar el repositorio

### Verificar instalación
```bash
node --version
npm --version
```

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio> vigilance-frontend
cd vigilance-frontend
```

### 2. Instalar dependencias
Con npm:
```bash
npm install
```

Con bun:
```bash
bun install
```

### 3. Configurar variables de entorno (opcional)
Créa un archivo `.env.local` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

## 💻 Cómo Usar

### Iniciar Servidor de Desarrollo
```bash
npm run dev
# o con bun
bun run dev
```

El servidor estará disponible en `http://localhost:5173`

### Navegación Principal

#### 📡 Pestaña "Monitoreo en Vivo"
1. **Visualizar Cámaras**: El grid muestra todas las cámaras activas
2. **Seleccionar Cámara**: Haz clic en una cámara para seleccionarla
3. **Reorganizar Cámaras**: 
   - Arrastra cualquier cámara para cambiar su posición
   - El icono ⊕ indica que puedes mover la cámara
   - La nueva disposición se mantiene durante la sesión
4. **Ver Alertas**: Panel derecho muestra alertas activas en tiempo real
5. **Hacer Clic en Alerta**: Abre un modal de validación con opciones para confirmar o rechazar

#### 🔍 Pestaña "Registros Históricos"
1. **Búsqueda Rápida**: Usa el campo de búsqueda para encontrar registros por:
   - Nombre de cámara
   - Ubicación
   - ID del registro

2. **Filtrar por Tipo de Delito**:
   - Haz clic en el botón "Tipos de Delito"
   - Selecciona múltiples opciones correctamente
   - Un badge muestra cuántos filtros activos hay

3. **Filtrar por Estado**:
   - Haz clic en el botón "Estados"
   - Elige "Positivo Verdadero", "Falso Positivo" o "Pendiente"
   - Puedes seleccionar múltiples estados

4. **Filtrar por Fecha**:
   - Abre el selector de fecha
   - Elige un rango o una fecha específica
   - Los registros se filtran automáticamente

5. **Eliminar Filtros**:
   - Haz clic en la ✕ en cualquier badge para eliminar ese filtro
   - O usa "Limpiar" para eliminar todos los filtros

6. **Exportar Datos**:
   - "Exportar Todo": Descarga todos los registros filtrados en Excel
   - Usa las opciones del menú en cada fila para exportar registros individuales

### Validación de Alertas
Cuando haces clic en una alerta activa:
1. Se abre un modal con los detalles
2. Puedes ver:
   - Thumbnail/evidencia
   - Alertas relacionadas en otras cámaras
   - Información del evento
3. Valida el evento como:
   - ✅ **Verdadero Positivo**: El evento es realmente un delito
   - ❌ **Falso Positivo**: Falsa alarma del sistema
   - 📋 **Pendiente**: Requiere revisión posterior

## 📂 Estructura del Proyecto

```
vigilance-frontend/
├── src/
│   ├── components/              # Componentes React reutilizables
│   │   ├── AlertPanel.tsx       # Panel de alertas activas con scroll
│   │   ├── CameraGrid.tsx       # Grid drag-and-drop de cámaras
│   │   ├── DashboardHeader.tsx  # Encabezado del dashboard
│   │   ├── MetricsPanel.tsx     # Panel de métricas del sistema
│   │   ├── NavLink.tsx          # Componente de enlace de navegación
│   │   ├── RecordsSearch.tsx    # Interfaz de búsqueda de registros
│   │   ├── ValidationModal.tsx  # Modal de validación de alertas
│   │   ├── records/             # Componentes específicos de registros
│   │   │   ├── DateRangeFilter.tsx    # Filtro de rango de fechas
│   │   │   ├── RecordDetailModal.tsx  # Modal de detalles de registro
│   │   │   ├── RecordFilters.tsx      # Filtros avanzados (multi-criterio)
│   │   │   └── RecordTable.tsx        # Tabla de registros históricos
│   │   └── ui/                  # Componentes shadcn/ui
│   │
│   ├── config/                  # Configuración de la aplicación
│   │   └── api.ts              # Configuración de endpoints API
│   │
│   ├── data/                    # Datos mock para desarrollo local
│   │   └── mockData.ts         # Datos simulados de cámaras y alertas
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.tsx      # Hook para detectar pantallilla móvil
│   │   ├── use-toast.ts        # Hook para notificaciones
│   │   ├── useAlerts.ts        # Hook para gestionar alertas
│   │   └── useRecords.ts       # Hook para filtrado de registros históricos
│   │
│   ├── lib/                     # Utilidades
│   │   └── utils.ts            # Funciones auxiliares (cn, etc.)
│   │
│   ├── pages/                   # Páginas principales
│   │   ├── Dashboard.tsx       # Página principal del dashboard
│   │   └── NotFound.tsx        # Página 404
│   │
│   ├── services/                # Servicios y API calls
│   │   ├── api.ts              # Funciones de llamadas API
│   │   ├── exportService.ts    # Exportación a Excel/ZIP
│   │   └── websocket.ts        # Conexión WebSocket para tiempo real
│   │
│   ├── types/                   # Tipos TypeScript
│   │   └── surveillance.ts     # Interfaces y tipos del sistema
│   │
│   ├── App.tsx                  # Componente raíz
│   ├── main.tsx                 # Punto de entrada
│   └── index.css                # Estilos globales
│
├── public/                       # Archivos estáticos
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración TypeScript
├── tailwind.config.ts           # Configuración Tailwind CSS
├── vite.config.ts               # Configuración Vite
└── README.md                     # Este archivo
```

## 🎯 Características Detalladas

### Drag and Drop de Cámaras
El grid de cámaras ahora permite reposicionamiento mediante drag-and-drop:
- **Cómo usar**:
  1. Haz clic y mantén presionado en una cámara
  2. Arrastra hacia la posición deseada
  3. Suelta para soltar
- **Visual Feedback**:
  - La cámara se vuelve semi-transparente mientras se arrastra
  - El puntero cambia a indicar movimiento
  - Los cambios de posición son instantáneos

### Filtros Múltiples Avanzados
Sistema de filtrado con soporte para múltiples valores:
- **Tipos de Delito**: Selecciona múltiples tipos simultáneamente
- **Estados**: Filtra por uno o más estados de validación
- **Fechas**: Rango personalizable
- **Eliminación Individual**: Cada filtro puede eliminarse con un clic
- **Limpiar Todo**: Botón para resetear todos los filtros de una vez

### Panel de Alertas con Scroll
El panel de alertas activas cuenta con:
- Área desplazable con scroll automático
- Visualización clara de todas las alertas
- Información resumida para cada alerta
- Clic directo para validar

### Exportación Flexible
- **Exportar Todo**: Todos los registros filtrados a un archivo Excel
- **Exportar Individual**: Cada registro puede exportarse por separado
- Formatos: Excel (.xlsx) para lotes, ZIP para registros individuales

## ⚙️ Configuración Local

### Usando Datos Mock
Por defecto, la aplicación usa datos simulados. Para cambiar:

**En `src/hooks/useRecords.ts`:**
```typescript
const USE_MOCK = true; // Cambiar a false cuando el backend esté listo
```

### Conectarse al Backend Real
Una vez que el backend esté disponible:

1. Actualiza `USE_MOCK` a `false` en los hooks
2. Configura las URLs de API en `.env.local`:
   ```env
   VITE_API_URL=http://tu-servidor:puerto/api
   VITE_WS_URL=ws://tu-servidor:puerto/ws
   ```
3. Verifica que los endpoints del servicio API coincidan con tu backend

### Variables de Entorno Disponibles
```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws

# Modo
VITE_MODE=development|production
```

## 🛠️ Desarrollo

### Stack Tecnológico
- **React 18**: Framework UI
- **TypeScript**: Tipado estático
- **Vite**: Herramienta de compilación rápida
- **Tailwind CSS**: Utilidades CSS
- **shadcn/ui**: Componentes UI preconstruidos
- **React Router**: Enrutamiento
- **React Query**: Gestión de datos asincronos
- **date-fns**: Manipulación de fechas
- **Recharts**: Gráficos
- **Lucide Icons**: Iconografía

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Compilación
npm run build        # Compilar para producción
npm run build:dev    # Compilar en modo desarrollo

# Validación
npm run lint         # Ejecutar ESLint

# Preview
npm run preview      # Previsualizar build de producción
```

## 📦 Compilación para Producción

### Build
```bash
npm run build
```

Genera una carpeta `dist/` con los archivos optimizados.

### Desplegar
El contenido de `dist/` puede desplegarse en:
- **Netlify**: Push automático desde Git
- **Vercel**: Soporte nativo para Vite
- **GitHub Pages**: Requiere configuración adicional
- **Servidor propio**: Sirve archivos estáticos con nginx/apache

### Optimizaciones Incluidas
- Code splitting automático
- Minificación de JavaScript y CSS
- Compresión de imágenes
- Lazy loading de componentes
- Caché optimizado

## 🔐 Seguridad

**Consideraciones Importantes**:
- Las credenciales no se almacenan en el frontend
- Las llamadas API deben usar HTTPS en producción
- Implementa autenticación y autorización en el backend
- Valida todos los datos de entrada en el backend

## 🐛 Solución de Problemas

### "Module not found" Error
```bash
# Limpia node_modules y reinstala
rm -rf node_modules
npm install
```

### Puertos en uso
Si el puerto 5173 está en uso:
```bash
npm run dev -- --port 3000  # Usa puerto 3000
```

### Problemas con Filtros
- Asegúrate de que `USE_MOCK = true` en `useRecords.ts` para desarrollo
- Verifica que los datos mock tengan la estructura correcta

### WebSocket no conecta
- Verifica que el servidor WebSocket esté activo
- Comprueba la URL en `.env.local`
- Revisa la consola del navegador para errores


## 📄 Licencia

Este proyecto es propiedad privado. Todos Los derechos reservados.

## 📝 Changelog

### v1.0.0 - Versión Inicial
- ✅ Grid de cámaras con drag-and-drop
- ✅ Panel de alertas con scroll
- ✅ Filtros múltiples avanzados
- ✅ Exportación a Excel
- ✅ Interfaz responsiva completa
- ✅ Sistema de validación de alertas

---

**Última actualización**: Marzo 2026

**Desarrollado con ❤️ para seguridad y vigilancia inteligente**
