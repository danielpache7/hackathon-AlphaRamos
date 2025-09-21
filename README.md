# Sistema de Votación Hackathon

Sistema de votación en tiempo real para hackathons con interfaz de jueces y administrador.

## 🚀 Características

- **Autenticación por códigos**: Sistema simple de acceso con códigos únicos
- **Votación por criterios**: 8 criterios de evaluación con pesos específicos
- **Tiempo real**: Actualizaciones automáticas usando Supabase Realtime
- **Dashboard de administrador**: Monitoreo en vivo y gestión de votación
- **Exportación Excel**: Reportes detallados con múltiples hojas
- **Responsive**: Optimizado para móvil y desktop
- **Prevención de duplicados**: Un voto por juez por equipo

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Exportación**: SheetJS (xlsx)
- **Autenticación**: Sistema personalizado con códigos

## 📋 Configuración

### 1. Instalación

```bash
npm install
```

### 2. Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 3. Base de Datos Supabase

Crear las siguientes tablas:

```sql
-- Tabla de votos
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_name TEXT NOT NULL,
  squad_id TEXT NOT NULL,
  scores JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(judge_name, squad_id)
);

-- Tabla de configuración
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voting_status TEXT NOT NULL DEFAULT 'OPEN',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO settings (voting_status) VALUES ('OPEN');
```

### 4. Configuración de Datos

Los datos estáticos se configuran en `/src/config/`:

- `squads.ts`: Equipos, integrantes, mentores y retos
- `criteria.ts`: Criterios de evaluación y pesos
- `access-codes.ts`: Códigos de acceso para jueces y admins

## 🎯 Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## 👥 Roles y Códigos

### Jueces
- `JUDGE001` - Carmen J. de Jesús Ángeles G.
- `JUDGE002` - Herbert Torres Alejandro
- `JUDGE003` - Vanessa D. Alba C.
- `JUDGE004` - Deinel J. Cárdenas B.
- `JUDGE005` - Vitniza M. Torres E.

### Administradores
- `ADMIN001` - Administrator

## 📊 Criterios de Evaluación

1. **Solución al problema (20%)** - Responde al reto y aporta valor
2. **Creatividad e innovación (15%)** - Enfoque novedoso
3. **Funcionalidad técnica (15%)** - Prototipo funcional
4. **Viabilidad (15%)** - Realista y factible
5. **Experiencia de usuario (10%)** - Interfaz clara
6. **Potencial de impacto (10%)** - Impacto comercial/operativo
7. **Comunicación (10%)** - Claridad en la presentación
8. **Trabajo en equipo (5%)** - Organización y colaboración

## 🏆 Equipos Participantes

12 equipos configurados con sus integrantes, mentores y retos específicos.

## 📈 Funcionalidades del Administrador

- **Dashboard en tiempo real**: Rankings y progreso de jueces
- **Control de votación**: Abrir/cerrar votación
- **Gestión de votos**: Eliminar votos para re-votación
- **Exportación Excel**: Reportes básicos y detallados
- **Diagnóstico del sistema**: Verificación de salud
- **Visualización de ganadores**: Top 3 automático

## 📱 Funcionalidades del Juez

- **Lista de equipos**: Información completa de cada squad
- **Modal de votación**: Calificación por criterios (1-10)
- **Progreso personal**: Barra de progreso de votación
- **Confirmación visual**: Estado de votos enviados
- **Tiempo real**: Actualizaciones automáticas

## 🔧 Estructura del Proyecto

```
src/
├── app/                 # Páginas de Next.js
├── components/          # Componentes React
├── config/             # Configuración estática
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades y servicios
└── types/              # Tipos TypeScript
```

## 🚨 Solución de Problemas

### Error de Conexión Supabase
- Verificar variables de entorno
- Comprobar configuración de Supabase
- Revisar permisos de tablas

### Problemas de Tiempo Real
- Verificar suscripciones de Supabase
- Comprobar conexión a internet
- Revisar logs del navegador

### Errores de Votación
- Verificar restricciones de base de datos
- Comprobar validación de datos
- Revisar estado de votación (OPEN/CLOSED)

## 📄 Licencia

Proyecto desarrollado para hackathon interno.# hackathon-AlphaRamos
