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

La pantalla permite consultar las solicitudes de adopción, buscar por adoptante/mascota/código, filtrar por estado o mascota, aprobar y cancelar solicitudes pendientes, y editar la fecha y descripción de una solicitud pendiente. Las reglas de negocio se validan en el backend; los mensajes de error del API se presentan en la interfaz.

### Pruebas manuales sugeridas

1. Iniciar el backend y ejecutar `npm run dev`.
2. Abrir `/adoption-requests` y comprobar que se cargue la lista.
3. Buscar por nombre de adoptante o mascota y aplicar los filtros.
4. Aprobar una solicitud pendiente válida y comprobar el cambio de estado.
5. Intentar aprobar una solicitud cuyo adoptante tenga una adopción activa; comprobar que se muestre el error del backend.
6. Cancelar una solicitud pendiente y comprobar que ya no aparezcan acciones de edición.
7. Editar la fecha o descripción de una solicitud pendiente y guardar.
8. Apagar el backend y comprobar que la pantalla muestre un error y permita reintentar.

## Integración con Git

Desarrollar la HU03 en `feature/HU03`. Crear un Pull Request hacia `Develop` y solicitar la revisión de un compañero antes de fusionar.
