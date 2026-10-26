# Pets – Front-end

Aplicación web para gestionar adopciones de mascotas. Proyecto de Modelos de Programación, Universidad Distrital, grupo G81.

## Tecnologías

- React + Vite
- JavaScript (JSX)
- React Router
- CSS Modules
- Vitest y React Testing Library

## Requisitos

- Node.js compatible con la versión de Vite definida en `package.json`.
- Backend Spring Boot ejecutándose en `http://localhost:8080`.

## Instalación y ejecución

```bash
npm ci
npm run dev
```

Abre la URL que muestre Vite (normalmente `http://localhost:5173`). La configuración de Vite reenvía las peticiones `/api` a `http://localhost:8080`.

## Scripts

```bash
npm test
npm run test:coverage
npm run lint
npm run build
```

## HU03 – Gestionar solicitud de adopción

Ruta: `/adoption-requests`.

La pantalla permite consultar y visualizar las solicitudes de adopción, buscar por adoptante, mascota o código de solicitud, filtrar por estado o mascota y acceder a las opciones de gestión disponibles en la interfaz, como aprobar, cancelar y editar solicitudes pendientes.

Estado de integración: La conexión con el backend está pendiente. Por lo tanto, las operaciones de consulta, aprobación, cancelación y edición aún no están verificadas mediante una integración completa con el servicio backend. El comportamiento de la interfaz se valida mediante pruebas automatizadas con Vitest y React Testing Library, utilizando servicios simulados (mocks).

### Ejecución de pruebas:
npm test
### Ejecución de pruebas con cobertura:
npm run test:coverage
### Pruebas manuales pendientes de integración

Una vez conectado el frontend con el backend, se deberán verificar los siguientes escenarios:

1.Iniciar el backend y ejecutar npm run dev.

2.Abrir /adoption-requests y comprobar que se carguen las solicitudes reales.

3.Buscar por nombre de adoptante, mascota o código y aplicar los filtros.

4.Aprobar una solicitud pendiente válida y verificar el cambio de estado en el backend.

5.Intentar aprobar una solicitud cuyo adoptante ya tenga una adopción activa y verificar el mensaje de error devuelto por el backend.

6.Cancelar una solicitud pendiente y comprobar que se actualice su estado.

7.Editar la fecha o descripción de una solicitud pendiente y verificar que los cambios persistan.

8.Desconectar el backend y comprobar el manejo del error de conexión y la opción de reintentar.


