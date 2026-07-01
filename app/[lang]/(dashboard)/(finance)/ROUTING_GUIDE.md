# 🗺️ Guía de Rutas - Módulo de Finanzas

## ⚠️ IMPORTANTE: Prefijo de Idioma

Este proyecto usa Next.js con internacionalización (i18n). **Todas las rutas requieren un prefijo de idioma**.

## 🌐 Idiomas Disponibles
- `en` - English (default)
- `es` - Español
- `ar` - Arabic

## ✅ Rutas Correctas

### Con Prefijo de Idioma (CORRECTO)

#### Inglés (EN)
- `http://localhost:3000/en/finance` - Dashboard
- `http://localhost:3000/en/finance/transactions` - Transacciones
- `http://localhost:3000/en/finance/cuentas` - Cuentas
- `http://localhost:3000/en/finance/categorias` - Categorías
- `http://localhost:3000/en/finance/reportes` - Reportes

#### Español (ES)
- `http://localhost:3000/es/finance` - Dashboard
- `http://localhost:3000/es/finance/transactions` - Transacciones
- `http://localhost:3000/es/finance/cuentas` - Cuentas
- `http://localhost:3000/es/finance/categorias` - Categorías
- `http://localhost:3000/es/finance/reportes` - Reportes

### Sin Prefijo (SE AUTO-REDIRIGE)
Si visitas:
- `http://localhost:3000/finance`

El middleware automáticamente te redirigirá a:
- `http://localhost:3000/en/finance` (si tu navegador está en inglés)
- `http://localhost:3000/es/finance` (si tu navegador está en español)

## 🔧 Estructura de Rutas en Next.js

```
app/[lang]/(dashboard)/(finance)/
├── page.jsx                    → /[lang]/finance
├── transactions/
│   └── page.jsx                → /[lang]/finance/transactions
├── cuentas/
│   └── page.jsx                → /[lang]/finance/cuentas
├── categorias/
│   └── page.jsx                → /[lang]/finance/categorias
└── reportes/
    └── page.jsx                → /[lang]/finance/reportes
```

**Nota:** Los paréntesis `(finance)` y `(dashboard)` son "route groups" de Next.js y NO aparecen en la URL.

## 🚀 Cómo Acceder

### Opción 1: Desde el Navegador
```
http://localhost:3000/en/finance
```

### Opción 2: Desde el Menú Lateral
1. Abre el sidebar
2. Busca "Control Interno"
3. Click en "Finanzas"
4. Selecciona la sección deseada

### Opción 3: Auto-Redirect
```
http://localhost:3000/finance
```
→ Se redirige automáticamente a `/en/finance` o `/es/finance`

## 🐛 Solución de Problemas

### Error 404
**Problema:** Visitaste `/finance` y obtuviste 404

**Solución:** Usa la ruta completa con el prefijo de idioma:
- ✅ `http://localhost:3000/en/finance`
- ❌ `http://localhost:3000/finance` (solo funciona si el middleware está activo)

### Middleware No Funciona
**Problema:** El auto-redirect no funciona

**Solución:** 
1. Verifica que el servidor esté corriendo: `npm run dev`
2. Limpia caché del navegador
3. Usa la ruta completa con prefijo

### Página en Blanco
**Problema:** La página carga pero está en blanco

**Solución:**
1. Abre la consola del navegador (F12)
2. Revisa errores de JavaScript
3. Verifica que todos los imports estén correctos

## 📍 Menú del Sistema

El menú lateral está configurado en `config/menus.js`:

```javascript
{
  title: "finanzas",
  icon: Bank,
  href: "/finance",  // Automáticamente se convierte a /[lang]/finance
  child: [
    { title: "dashboard", href: "/finance" },
    { title: "transacciones", href: "/finance/transactions" },
    { title: "cuentas", href: "/finance/cuentas" },
    { title: "categorias", href: "/finance/categorias" },
    { title: "reportes", href: "/finance/reportes" },
  ]
}
```

Los links en el menú automáticamente agregan el prefijo `[lang]` gracias al sistema de Next.js.

## ✅ Verificación Rápida

### Test de Rutas
Prueba estas URLs en tu navegador:

1. **Dashboard:**
   ```
   http://localhost:3000/en/finance
   ```
   Deberías ver: Dashboard financiero con 4 cards de estadísticas

2. **Transacciones:**
   ```
   http://localhost:3000/en/finance/transactions
   ```
   Deberías ver: Tabla de transacciones con botón "Nueva Transacción"

3. **Cuentas:**
   ```
   http://localhost:3000/en/finance/cuentas
   ```
   Deberías ver: Grid de tarjetas de cuentas

4. **Categorías:**
   ```
   http://localhost:3000/en/finance/categorias
   ```
   Deberías ver: Tabs de Ingresos/Egresos con categorías

5. **Reportes:**
   ```
   http://localhost:3000/en/finance/reportes
   ```
   Deberías ver: Página de reportes con gráficas

## 🎯 Recomendación

**Usa siempre las rutas con prefijo de idioma para evitar problemas:**

✅ **Correcto:**
- `/en/finance`
- `/es/finance`

❌ **Evitar (puede dar 404):**
- `/finance` (solo funciona con middleware activo)

## 🔄 Después de Cambios

Si modificas archivos y los cambios no se reflejan:

1. **Guarda todos los archivos** (Ctrl+S)
2. **Espera la recompilación** (verás en la terminal)
3. **Recarga la página** (Ctrl+R o F5)
4. **Limpia caché si es necesario** (Ctrl+Shift+R)

## 📱 En Producción

Cuando despliegues a producción, las rutas funcionarán igual:
- `https://tu-dominio.com/en/finance`
- `https://tu-dominio.com/es/finance`

Y el auto-redirect desde `/finance` funcionará automáticamente.

---

## ✅ RUTAS ACTUALIZADAS

Todas las rutas en el código han sido actualizadas para usar `/finance/transactions` en lugar de `/transactions`.

**¡El módulo debería funcionar correctamente ahora!** 🎉

