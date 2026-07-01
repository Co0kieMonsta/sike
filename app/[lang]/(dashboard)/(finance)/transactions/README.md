# Módulo de Finanzas - Transacciones

## 🎯 Características Implementadas

### ✅ Transacciones Financieras

#### Dashboard con Estadísticas
- 📊 **Total Transacciones** - Contador total
- 💰 **Ingresos** - Total de ingresos (verde)
- 💸 **Egresos** - Total de egresos (rojo)
- 💼 **Balance** - Balance neto (verde/rojo según balance)

#### CRUD Completo de Transacciones
- ✅ **Crear** - Registrar nuevas transacciones
- ✅ **Leer** - Vista detallada en tabla avanzada
- ✅ **Actualizar** - Editar transacciones existentes
- ✅ **Eliminar** - Eliminar transacciones (individual y masivo)

#### Campos de Transacción
- ID único (TRX-XXX)
- Fecha
- Tipo (Ingreso/Egreso) con iconos
- Categoría y Subcategoría
- Monto (formato moneda con color por tipo)
- Método de pago (Efectivo, Transferencia, Cheque, Tarjeta)
- Cuenta
- Descripción
- Referencia (opcional)
- Estado (Completado, Pendiente, Cancelado)
- Comprobante (opcional)

### 🎨 UI/UX Features

#### Tabla Avanzada
- Búsqueda por descripción
- Filtros por tipo (Ingreso/Egreso)
- Filtros por estado
- Ordenamiento por columnas
- Paginación configurable
- Selección múltiple
- Vista personalizable

#### Barra de Resumen
- Muestra ingresos totales
- Muestra egresos totales
- Muestra balance con color dinámico
- Se actualiza con filtros

#### Acciones por Transacción
- ✏️ **Editar** - Botón rápido + menú
- 👁️ **Ver detalles**
- 📋 **Copiar ID**
- 📄 **Copiar referencia**
- ⬇️ **Descargar comprobante**
- 🔄 **Cambiar estado** (submenu con 3 opciones)
- 🗑️ **Eliminar**

#### Formulario Completo
- Todos los campos con iconos
- Validación con Zod
- Selector de fecha
- Selector de categorías dinámico según tipo
- Selector de cuentas desde API
- Campo de monto con formato numérico
- Descripción con textarea
- Estados y métodos con iconos

### 📤 Funciones Adicionales

- **Exportar** - Descargar transacciones en JSON
- **Eliminar Masivo** - Seleccionar y eliminar múltiples
- **Cambio Rápido de Estado** - Desde el menú contextual
- **Toast Notifications** - Para todas las acciones

## 📁 Estructura de Archivos

```
app/[lang]/(dashboard)/(finance)/transactions/
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
    └── transaction-form-dialog.jsx   # Formulario de transacción

app/api/finanzas/
├── transacciones/
│   ├── data.js                       # Datos de transacciones, cuentas y categorías
│   ├── route.js                      # API: GET, POST
│   └── [id]/
│       └── route.js                  # API: GET, PUT, DELETE
├── cuentas/
│   └── route.js                      # API de cuentas
└── categorias/
    └── route.js                      # API de categorías

config/
└── finanzas.config.js                # Funciones de servicio
```

## 🚀 API Endpoints

### Transacciones
- `GET /api/finanzas/transacciones` - Obtener todas (con filtros)
- `POST /api/finanzas/transacciones` - Crear transacción
- `GET /api/finanzas/transacciones/[id]` - Obtener una transacción
- `PUT /api/finanzas/transacciones/[id]` - Actualizar transacción
- `DELETE /api/finanzas/transacciones/[id]` - Eliminar transacción

### Cuentas
- `GET /api/finanzas/cuentas` - Obtener todas las cuentas
- `POST /api/finanzas/cuentas` - Crear cuenta

### Categorías
- `GET /api/finanzas/categorias` - Obtener categorías (filtrable por tipo)
- `POST /api/finanzas/categorias` - Crear categoría

## 📊 Datos de Prueba

### 12 Transacciones de Ejemplo
- Ingresos: Ventas, Servicios, Otros ingresos
- Egresos: Nómina, Gastos operativos, Compras, Marketing, etc.
- Varios métodos de pago
- Diferentes estados

### 5 Cuentas
- Banco Principal
- Caja General
- Caja Chica
- Tarjeta Corporativa
- Banco Secundario

### 9 Categorías
- 3 de Ingresos
- 6 de Egresos
- Cada una con icono y color

## 🎯 Uso

### Acceder
Navega a `/transactions` en el dashboard

### Crear Transacción
1. Click en "Nueva Transacción"
2. Completa el formulario
3. Las categorías se filtran según el tipo seleccionado
4. Click en "Crear"

### Editar Transacción
1. Click en el icono de lápiz o menú de acciones
2. Modifica los campos necesarios
3. Click en "Actualizar"

### Eliminar Transacciones
- **Individual**: Menú de acciones → Eliminar
- **Masivo**: Seleccionar filas → "Eliminar seleccionadas"

### Cambiar Estado
Menú de acciones → Cambiar estado → Seleccionar nuevo estado

## 💡 Características Destacadas

### 1. Colores Dinámicos
- Ingresos siempre en verde
- Egresos siempre en rojo
- Balance cambia color según positivo/negativo

### 2. Barra de Resumen Inteligente
- Se actualiza con los datos filtrados
- Muestra totales en tiempo real

### 3. Categorías Dinámicas
- El selector de categorías muestra solo las del tipo seleccionado
- Si seleccionas "Ingreso", solo ves categorías de ingreso

### 4. Validación Completa
- Todos los campos requeridos validados
- Monto debe ser numérico
- Fecha requerida
- Descripción mínimo 5 caracteres

## 🔮 Próximas Mejoras

- [ ] Gráficas de ingresos vs egresos
- [ ] Reportes por periodo
- [ ] Filtros por rango de fechas
- [ ] Gestión de cuentas (CRUD completo)
- [ ] Gestión de categorías (CRUD completo)
- [ ] Dashboard financiero con KPIs
- [ ] Exportar a Excel/PDF
- [ ] Adjuntar comprobantes
- [ ] Notificaciones de pago
- [ ] Presupuestos

## 🎨 Iconos Utilizados

- 💰 DollarSign - Transacciones generales
- 📈 TrendingUp - Ingresos
- 📉 TrendingDown - Egresos
- 💼 Wallet - Cuentas/Balance
- 📅 Calendar - Fechas
- 🏷️ Tags - Categorías
- 💳 CreditCard - Métodos de pago
- ✅ CheckCircle - Estados
- 📄 FileText - Documentos/Referencias

## 🚀 Listo para Usar!

El módulo de transacciones está completamente funcional y listo para registrar tus movimientos financieros. ¡Sin errores de linter!

