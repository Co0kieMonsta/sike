# CRUD Features & Icons - Módulo de Usuarios

## 🎨 Enhanced UI with Icons

### 📊 Dashboard Statistics Cards
- **Total Usuarios** - Icon: `Users` (muted)
- **Usuarios Activos** - Icon: `Users` (green)
- **Administradores** - Icon: `Users` (red)
- **Pendientes** - Icon: `Users` (yellow)

### 🔧 Toolbar Actions

#### Main Actions
1. **Buscar** - Search input with placeholder
2. **Filtrar por Estado** - Dropdown filter with icons
3. **Filtrar por Rol** - Dropdown filter with icons
4. **Limpiar Filtros** - Icon: `X`
5. **Actualizar** - Icon: `RefreshCw`
6. **Nuevo Usuario** - Icon: `Plus`
7. **Vista** - Icon: `SlidersHorizontal`

#### Actions Dropdown
- **Exportar usuarios** - Icon: `Download`
- **Importar usuarios** - Icon: `Upload`
- **Crear usuario** - Icon: `UserPlus`

#### Bulk Actions (when rows selected)
- Shows selected count
- **Eliminar seleccionados** - Icon: `Trash2` (destructive)

### ⚡ Row Actions

#### Quick Actions
- **Editar** - Icon: `Pencil` (quick button)
- **Más acciones** - Icon: `MoreHorizontal` (dropdown)

#### Dropdown Menu Options

**Acciones principales:**
- **Ver detalles** - Icon: `Eye`
- **Editar usuario** - Icon: `Pencil`

**Información de contacto:**
- **Copiar email** - Icon: `Mail`
- **Copiar teléfono** - Icon: `Phone`
- **Copiar ID** - Icon: `Copy`

**Cambiar estado:** (Submenu)
- **Activo** - Icon: `UserCheck` (green)
- **Inactivo** - Icon: `UserX` (yellow)
- **Pendiente** - Icon: `UserCheck` (gray)

**Cambiar rol:** (Submenu)
- **Admin** - Icon: `Shield` (red)
- **Manager** - Icon: `Shield` (blue)
- **User** - Icon: `Shield` (gray)

**Acción destructiva:**
- **Eliminar usuario** - Icon: `Trash2` (red)

### 📝 User Form Dialog

#### Form Header
- **Nuevo Usuario** - Icon: `UserPlus`
- **Editar Usuario** - Icon: `UserCog`

#### Form Fields with Icons
1. **Nombre Completo** - Icon: `User`
2. **Email** - Icon: `Mail`
3. **Contraseña** - Icon: `Lock`
4. **Teléfono** - Icon: `Phone`
5. **Rol** - Icon: `Shield`
   - Admin - `Shield` (red)
   - Manager - `Shield` (blue)
   - User - `User` (gray)
6. **Estado** - Icon: `CheckCircle`
   - Activo - `CheckCircle` (green)
   - Inactivo - `CheckCircle` (yellow)
   - Pendiente - `CheckCircle` (gray)
7. **Departamento** - Icon: `Building`
8. **Posición** - Icon: `Briefcase`

#### Form Actions
- **Cancelar** - Outline button
- **Crear** - Icon: `UserPlus` + text
- **Actualizar** - Icon: `UserCog` + text
- **Loading** - Icon: `Loader2` (spinning)

### 🗑️ Delete Dialogs

#### Single Delete
- **Title** - Icon: `Trash2`
- Shows user name
- **Eliminar** button with `Trash2` icon

#### Bulk Delete
- **Title** - Icon: `Trash2`
- Shows count of users
- Lists all users to be deleted
- **Eliminar X usuario(s)** button with `Trash2` icon

## 🚀 CRUD Operations

### ✅ Create (Crear)
- **Button:** "Nuevo Usuario" with `Plus` icon
- **Dialog:** User form with validation
- **Icon:** `UserPlus` in dialog header and submit button
- **Toast:** Success notification on creation

### 📖 Read (Leer)
- **Table:** Advanced data table with all user info
- **Search:** Filter by name
- **Filters:** By role and status
- **Sorting:** All columns sortable
- **Pagination:** 10, 20, 30, 40, 50 rows per page
- **View Options:** Show/hide columns

### ✏️ Update (Actualizar)
- **Quick Edit:** `Pencil` icon button in row
- **Full Edit:** From dropdown menu
- **Dialog:** Pre-filled form with user data
- **Icon:** `UserCog` in dialog header
- **Quick Updates:**
  - Change status (3 options with icons)
  - Change role (3 options with icons)
- **Toast:** Success notification on update

### 🗑️ Delete (Eliminar)
- **Single Delete:**
  - From dropdown menu with `Trash2` icon
  - Confirmation dialog required
  - Toast notification on success
- **Bulk Delete:**
  - Select multiple rows via checkbox
  - "Eliminar seleccionados" button appears
  - Shows list of users to be deleted
  - Confirmation dialog required
  - Toast notification with count

## 📤 Additional Features

### Export
- **Icon:** `Download`
- **Action:** Export all users to JSON
- **File:** `usuarios_YYYY-MM-DD.json`
- **Toast:** Success notification

### Import
- **Icon:** `Upload`
- **Action:** Import users from JSON file
- **Validation:** Array format check
- **Toast:** Shows count of users to import

### Copy to Clipboard
- **Email:** `Mail` icon - Copies user email
- **Phone:** `Phone` icon - Copies user phone
- **ID:** `Copy` icon - Copies user ID
- **Toast:** Confirmation on copy

### Refresh
- **Icon:** `RefreshCw`
- **Action:** Reload user data from API
- **Toast:** Optional notification

## 🎯 Icon Color Coding

### Status Colors
- 🟢 **Active/Success** - Green (#10b981)
- 🟡 **Inactive/Warning** - Yellow (#eab308)
- ⚪ **Pending/Neutral** - Gray (#6b7280)
- 🔴 **Delete/Destructive** - Red (#ef4444)

### Role Colors
- 🔴 **Admin** - Red (#dc2626)
- 🔵 **Manager** - Blue (#3b82f6)
- ⚪ **User** - Gray (#6b7280)

## 📱 Responsive Design
- Mobile-friendly toolbar
- Collapsible filters on small screens
- Responsive form layout
- Touch-friendly action buttons
- Readable table on all devices

## ♿ Accessibility
- Screen reader labels (`sr-only`)
- Keyboard navigation support
- Focus indicators
- ARIA labels on interactive elements
- Semantic HTML structure

## 🎨 Visual Enhancements
- Consistent icon sizes (h-4 w-4 for most, h-5 w-5 for headers)
- Color-coded badges and icons
- Hover states on all interactive elements
- Smooth transitions
- Loading states with spinners
- Toast notifications for all actions

## 🔔 Toast Notifications
All CRUD operations show toast notifications:
- ✅ Success (green)
- ❌ Error (red)
- ℹ️ Info (blue)

**Messages include:**
- "Usuario creado exitosamente"
- "Usuario actualizado exitosamente"
- "Usuario eliminado exitosamente"
- "X usuario(s) eliminado(s) exitosamente"
- "Estado actualizado exitosamente"
- "Rol actualizado exitosamente"
- "Email copiado al portapapeles"
- "Usuarios exportados exitosamente"
- Error messages for failed operations

