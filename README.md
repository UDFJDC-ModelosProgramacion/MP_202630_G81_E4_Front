# Pets – Front-end

Aplicación web para gestionar adopciones de mascotas. Proyecto de Modelos de Programación, Universidad Distrital Francisco José de Caldas, grupo G81.

## Requisitos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js y npm.
- El backend Spring Boot en ejecución en `http://localhost:8080`.

## Instalación y ejecución

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/UDFJDC-ModelosProgramacion/MP_202630_G81_E4_Front.git
   ```

2. Ingresar a la carpeta del proyecto:

   ```bash
   cd MP_202630_G81_E4_Front
   ```

3. Instalar las dependencias:

   ```bash
   npm ci
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abrir en el navegador la dirección que muestra Vite, normalmente:

   `http://localhost:5173`

## Ejecución de pruebas

Para ejecutar las pruebas automatizadas:

```bash
npm test
```

## Otros comandos

```bash
npm run lint
npm run build
npm run test:coverage
```

**Nota:** El frontend utiliza el backend Spring Boot para las operaciones que requieren persistencia. La configuración de Vite redirige las peticiones realizadas a `/api` hacia `http://localhost:8080`.
