# PizzaMásAllá - Terminal Táctil POS

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Build](https://img.shields.io/badge/Build-manual%20(Vite)-yellow)
![License](https://img.shields.io/badge/License-not%20declared-lightgrey)

Sistema de punto de venta para la operación de pedidos de PizzaMásAllá, con una interfaz de selección táctil y persistencia de ventas en PostgreSQL.

## Resumen ejecutivo

PizzaMásAllá - Terminal Táctil POS es una aplicación web diseñada para agilizar la captura de pedidos en mostrador y en entornos de servicio de alta velocidad. La interfaz prioriza controles amplios, lectura rápida del catálogo y edición directa de la comanda para facilitar su uso en pantallas táctiles.

El cliente web consulta los productos disponibles y envía las ventas al servidor. El backend registra cada venta y sus partidas dentro de una transacción PostgreSQL. El alcance actual cubre el flujo de catálogo y registro de ventas; no incluye autenticación de usuarios ni procesamiento de pagos externos.

## Características principales

- **Interfaz táctil:** controles de tamaño amplio para agregar, ajustar y quitar productos sin depender de emojis.
- **Catálogo consultado desde el backend:** muestra los productos activos definidos en PostgreSQL.
- **Búsqueda y filtros de interfaz:** búsqueda por nombre o descripción y opciones de categoría visuales.
- **Carrito en tiempo real:** agrupación de productos y ajuste de cantidades durante la captura.
- **Desglose monetario:** cálculo inmediato de subtotal y total en MXN. Actualmente no se aplican descuentos.
- **Registro transaccional:** persistencia de la venta y sus detalles mediante una transacción en PostgreSQL.
- **Método de pago:** captura de efectivo, tarjeta o transferencia como dato de la venta; no se ejecuta un cobro electrónico.
- **Folio de venta:** respuesta de confirmación con folio y fecha de registro.

> **Alcance de categorías:** la interfaz ofrece filtros de categoría, pero el esquema actual no almacena una categoría por producto. En consecuencia, los productos sin ese atributo reciben una categoría visual predeterminada.

## Arquitectura y stack tecnológico

La solución se organiza en tres componentes:

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS | Interfaz de punto de venta, catálogo, comanda y cálculo del importe |
| Backend | Node.js, Express 5, `pg`, Axios | API REST, consulta de productos y registro de ventas |
| Base de datos | PostgreSQL | Catálogo, usuarios, promociones, ventas y detalle de ventas |

El frontend consume la API local en `http://localhost:5000`. El backend expone los endpoints descritos en [API REST](#api-rest).

## Estructura del repositorio

```text
.
├── backend/
│   ├── db.js                 # Conexión mediante el pool de node-postgres
│   ├── package.json          # Dependencias del servidor
│   └── server.js             # API Express
├── database/
│   ├── schema.sql            # Tablas y relaciones
│   └── seed.sql              # Datos de demostración
├── frontend/
│   ├── public/               # Recursos estáticos
│   ├── src/
│   │   ├── assets/           # Recursos gráficos
│   │   ├── App.jsx           # Interfaz y flujo de venta
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx          # Punto de entrada de React
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Estrategia de ramas y módulos

El repositorio utiliza una estrategia inspirada en Git Flow: `main` como rama de integración estable y `develop` para integrar el trabajo activo. Las ramas `feature/*` aíslan los módulos asignados y deben integrarse mediante pull request según el flujo acordado por el equipo.

| Rama | Módulo | Integrante |
|---|---|---|
| `main` | Versión estable | Equipo |
| `develop` | Integración de desarrollo | Equipo |
| `feature/frontend-catalogo-aiko` | Catálogo frontend | Aiko |
| `feature/backend-auth-alexander` | Autenticación backend | Alexander |
| `feature/backend-db-fernando` | Base de datos backend | Fernando |
| `feature/backend-ventas-damian` | Ventas backend | Damián |
| `feature/frontend-carrito-agustin` | Carrito frontend | Agustín |

Los nombres y asignaciones reflejan la estructura de ramas solicitada para el proyecto. La autenticación figura como módulo asignado, pero todavía no está implementada en los endpoints actuales.

## Instalación y ejecución local

### Requisitos

- Node.js y npm, en versiones compatibles con Vite 8.
- PostgreSQL en ejecución y acceso para crear una base de datos.
- Git.

### 1. Crear la base de datos

Desde la raíz del repositorio, crea la base y carga el esquema y los datos de demostración:

```bash
createdb pizza_mas_alla
psql -d pizza_mas_alla -f database/schema.sql
psql -d pizza_mas_alla -f database/seed.sql
```

También puedes ejecutar los dos archivos con cualquier cliente PostgreSQL con permisos de creación y escritura.

### 2. Configurar y ejecutar el backend

El backend lee las variables de conexión con `dotenv`. Crea `backend/.env` con los datos de tu entorno local:

```dotenv
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=pizza_mas_alla
DB_PASSWORD=tu_clave_local
DB_PORT=5432
```

No uses contraseñas reales en archivos versionados. Instala dependencias e inicia el servidor:

```bash
cd backend
npm install
node server.js
```

El servidor escucha en el puerto `5000` de forma predeterminada. El endpoint de salud está disponible en `http://localhost:5000/api/health`.

### 3. Instalar y ejecutar el frontend

En otra terminal, desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

Abre en el navegador la URL local que indique Vite (normalmente `http://localhost:5173`). La aplicación espera que el backend esté disponible en `http://localhost:5000`.

### Compilación y lint del frontend

Desde `frontend/`:

```bash
npm run build
npm run lint
```

El repositorio no incluye actualmente una configuración de integración continua; la insignia de compilación indica que el build se ejecuta manualmente con Vite y no representa un estado de CI.

## API REST

El servidor está configurado con CORS y JSON. Las rutas implementadas son:

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Devuelve el estado del servidor. |
| `GET` | `/api/productos` | Devuelve los productos activos ordenados por ID. |
| `POST` | `/api/ventas` | Registra una venta y sus partidas en PostgreSQL. |

### `GET /api/productos`

Respuesta: arreglo JSON con los campos devueltos por la tabla `productos`, actualmente `id`, `nombre`, `descripcion`, `precio` y `activo`.

### `POST /api/ventas`

Ejemplo de cuerpo:

```json
{
  "subtotal": 189,
  "total": 189,
  "metodoPago": "Efectivo",
  "productos": [
    {
      "id": 1,
      "nombre": "Pizza Pepperoni Familiar",
      "precio": 189,
      "cantidad": 1
    }
  ]
}
```

En una respuesta satisfactoria, el servidor devuelve `status`, `mensaje`, `folio` y `fecha`. Si la lista de productos está vacía, responde con HTTP `400`; ante un error de base de datos, responde con HTTP `500`. El backend guarda el subtotal y total recibidos y persiste cada partida dentro de una transacción.

## Créditos y equipo de desarrollo

Proyecto académico y colaborativo de PizzaMásAllá. Módulos y asignaciones:

- **Aiko:** catálogo frontend.
- **Alexander:** autenticación backend.
- **Fernando:** base de datos backend.
- **Damián:** ventas backend.
- **Agustín:** carrito frontend.

## Estado, seguridad y licencia

La aplicación es una base funcional para desarrollo local y demostración. Antes de un despliegue productivo, deben incorporarse controles de autenticación y autorización, validación de importes y productos en el servidor, gestión segura de secretos y pruebas automatizadas. Los registros de usuarios de `database/seed.sql` son datos de demostración, no credenciales de producción.

No se ha encontrado un archivo `LICENSE` en la raíz del repositorio. La licencia declarada por el paquete del backend no establece por sí sola la licencia del proyecto completo; agrega y confirma una licencia de repositorio antes de distribuirlo.
