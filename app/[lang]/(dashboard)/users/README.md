# Módulo de Usuarios

Este módulo implementa la gestión completa de usuarios en el sistema dashboard.

## Características

### ✅ Funcionalidades Implementadas

1. **Lista de Usuarios con Tabla Avanzada**
   - Búsqueda y filtrado por nombre, rol y estado
   - Ordenamiento por columnas
   - Paginación configurable
   - Selección múltiple de registros
   - Vista personalizable de columnas

2. **CRUD Completo**
   - ✅ **Crear** - Formulario para agregar nuevos usuarios
   - ✅ **Leer** - Vista detallada de usuarios en tabla
   - ✅ **Actualizar** - Editar información de usuarios existentes
   - ✅ **Eliminar** - Eliminar usuarios con confirmación

3. **Campos de Usuario**
   - ID único
   - Nombre completo
   - Email
   - Contraseña (encriptada)
   - Teléfono
   - Rol (Admin, Manager, User)
   - Estado (Activo, Inactivo, Pendiente)
   - Departamento
   - Posición
   - Fecha de creación
   - Avatar/Imagen

4. **Validación de Formularios**
   - Validación en tiempo real con Zod
   - Mensajes de error descriptivos
   - Validación de emails únicos
   - Requisitos mínimos de contraseña

5. **UI/UX**
   - Diseño responsivo
   - Notificaciones toast para acciones
   - Diálogos de confirmación
   - Estados de carga
   - Filtros avanzados
   - Exportación de datos

## Estructura de Archivos

```
app/[lang]/(dashboard)/users/
├── page.jsx                          # Página principal
├── README.md                         # Esta documentación
└── components/
    ├── columns.jsx                   # Definición de columnas
    ├── data-table.jsx                # Componente de tabla
    ├── data-table-column-header.jsx  # Cabecera de columnas
    ├── data-table-faceted-filter.jsx # Filtros avanzados
    ├── data-table-pagination.jsx     # Paginación
    ├── data-table-row-actions.jsx    # Acciones por fila
    ├── data-table-toolbar.jsx        # Barra de herramientas
    ├── data-table-view-options.jsx   # Opciones de vista
    └── user-form-dialog.jsx          # Formulario de usuario

app/api/usuarios/
├── data.js                           # Datos de usuarios
├── route.js                          # API: GET, POST
└── [id]/
    └── route.js                      # API: GET, PUT, DELETE

config/
└── usuarios.config.js                # Funciones de servicio
```

## API Routes

### GET `/api/usuarios`
Obtiene todos los usuarios
```json
{
  "status": "success",
  "data": [...],
  "count": 10
}
```

### POST `/api/usuarios`
Crea un nuevo usuario
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "+1 234 567 8900",
  "role": "user",
  "status": "active",
  "department": "Ventas",
  "position": "Gerente"
}
```

### GET `/api/usuarios/[id]`
Obtiene un usuario específico

### PUT `/api/usuarios/[id]`
Actualiza un usuario existente

### DELETE `/api/usuarios/[id]`
Elimina un usuario

## Uso

### Acceder al Módulo
Navega a `/users` en el dashboard o usa el menú lateral "Usuarios"

### Crear Usuario
1. Click en "Nuevo Usuario"
2. Completa el formulario
3. Click en "Crear"

### Editar Usuario
1. Click en el menú de acciones (⋮) en la fila del usuario
2. Selecciona "Editar"
3. Modifica los campos necesarios
4. Click en "Actualizar"

### Eliminar Usuario
1. Click en el menú de acciones (⋮) en la fila del usuario
2. Selecciona "Eliminar"
3. Confirma la acción

### Filtrar y Buscar
- Usa la barra de búsqueda para buscar por nombre
- Usa los filtros de Estado y Rol
- Click en "Limpiar" para resetear filtros

### Personalizar Vista
- Click en el botón "Vista" para mostrar/ocultar columnas
- Ajusta filas por página en el selector de paginación

## Roles y Permisos

### Admin
- Acceso completo al sistema
- Puede gestionar todos los usuarios
- Puede cambiar roles

### Manager
- Puede gestionar usuarios de su departamento
- Acceso limitado a configuración

### User
- Usuario estándar
- Acceso básico al sistema

## Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas
- **TanStack Table** - Tabla de datos avanzada
- **Radix UI** - Componentes de UI
- **Tailwind CSS** - Estilos
- **React Hot Toast** - Notificaciones

## Datos de Prueba

El sistema viene con 10 usuarios de prueba:

```
Email: dashtail@codeshaper.net
Password: password
Rol: Admin

Email: maria.gonzalez@company.com
Password: password123
Rol: User

Email: carlos.rodriguez@company.com
Password: password123
Rol: User

... (7 más)
```

## Próximas Mejoras

- [ ] Integración con base de datos real
- [ ] Autenticación con tokens JWT
- [ ] Roles y permisos más granulares
- [ ] Exportar usuarios a CSV/Excel
- [ ] Importar usuarios en lote
- [ ] Historial de cambios
- [ ] Avatar personalizado con upload
- [ ] Filtros avanzados adicionales
- [ ] Búsqueda por múltiples campos

## Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.

