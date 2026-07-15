# Resumen del repositorio — API MyPortfolio

Este documento resume lo implementado hasta ahora, archivo por archivo, y señala dónde quedó el trabajo (bugs, incongruencias o partes incompletas).

## Estado general
- Proyecto: API REST con Express, Mongoose, autenticación JWT, validación con Joi y envío de emails.
- Tests: hay pruebas de unitarias en `src/__tests__` pero no todas están completas y hay expectativas que no coinciden con el código.

## Resumen por archivos importantes

- **[src/main.js](src/main.js)**: Arranca Express, conecta a MongoDB y registra rutas (`/auth`, `/projects`, `/user`). Comentario con ejemplo de envío de mail (deshabilitado).

- **[src/config/env.config.js](src/config/env.config.js)**: Variables de entorno centralizadas.
- **[src/config/configMongoDB.config.js](src/config/configMongoDB.config.js)**: Función `connectToMongoDB()` que concatena `DB_LOCAL_HOST` y `DB_NAME`.
- **[src/config/mailTransporter.config.js](src/mailTransporter.config.js)**: Configura `nodemailer` con Gmail.

- **[src/Models/User.model.js](src/Models/User.model.js)**: Esquema completo con métodos de instancia: `canCreateProject`, `canCreatePrivateProject`, `getRoleLimits`.
- **[src/Models/Project.model.js](src/Models/Project.model.js)**: Esquema de proyecto con `owner`, `techStack`, `visibility`, `stars`.
- **[src/Models/File.model.js](src/Models/File.model.js)**: Esquema simple para archivos asociados a proyectos.

- **[src/constants/roles.constants.js](src/constants/roles.constants.js)**: `ROLES`, `ROLE_HIERARCHY`, `ROLE_LIMITS` definidos (límites por rol).

- **Repositorios (`src/repositories/*`)**:
  - `user.repository.js`: CRUD básico para `User`.
  - `project.repository.js`: CRUD y paginación para proyectos; usa `populate` para vendor info.
  - `file.repository.js`: CRUD y búsquedas por proyecto/idioma.

- **Servicios (`src/services/*`)**:
  - `auth.service.js`: Registro, verificación de email, login y refresh de tokens. Buen manejo de errores con `ServerError`.
    - Observación: en _register_ y _login_ elimina `passwordHash` antes de retornar.
  - `user.service.js`: Lógica de validación antes de delegar en `UserRepository` (create/get/update/delete).
  - `project.service.js`: Lógica de creación, consultas y validaciones del owner (resuelve owner por id/username/email).
  - `file.service.js`: Lógica para crear/leer/actualizar/borrar archivos. (VER ISSUES abajo)
  - `email.service.js`: Intenta enviar mails; contiene un error de sintaxis en el `catch` que rompe el módulo (VER ISSUES abajo).
  - `Error.service.js`: Define `ServerError` (ok).

- **Controladores (`src/controllers/*`)**:
  - `Auth.controller.js`: Mapea endpoints de auth a usecases; hay un `console.log` con variable `name` indefinida.
  - `user.controller.js`: Usa `UserService`. `updateById` llama a un método inexistente en `UserService` (VER ISSUES).
  - `project.controller.js`: Usa `ProjectService` pero llama a `ProjectService.findByTechStack` (no existe) y en `getByOwner` el bloque `catch` no devuelve respuesta al cliente.
  - `file.controller.js`: Falta la importación de `ServerError` (se utiliza en los catch), lo que provocará ReferenceError en errores.

- **Middlewares (`src/middlewares/*`)**:
  - `authMiddleware.js`: Autenticación JWT y comprobaciones de rol (parece correcto).
  - `project.middleware.js`: `loadProject`, `canViewProject`, `canModifyProjet` (nota: nombre con typo `canModifyProjet`), `checkProjectLimits` (usa `req.user.getRoleLimits()` sin await en mensajes; `getRoleLimits` es async en el modelo).
  - `validateRequest.js`: Middleware de validación con Joi (bien estructurado).

- **Rutas (`src/routes/*`)**:
  - `auth.routes.js`: Registro, login, verify-email, refresh.
  - `project.routes.js`: Rutas públicas y privadas. Algunas rutas POST/PUT usan middlewares correctamente; el `delete` no valida permisos ni carga el proyecto.
  - `file.routes.js`: Varias issues: `import FileController from "../controllers/file.controller"` falta extensión `.js` (consistencia con ES modules), y una ruta está definida sin la barra inicial: `fileRoutes.get("project/:project_id/path", ...)` debería ser `/project/:project_id/path`.
  - `user.routes.js`: Requiere `requiredMinRole` para operaciones administrativas; `create` está protegido por `ADMIN` (posible diseño intencional).

- **Schemas (`src/schemas/*`)**:
  - `auth.schema.js`: Reglas de Joi para registro/login (completas).
  - `project.schema.js`: Reglas para crear/actualizar proyectos.

- **Application (usecases)**:
  - `register-user.usecase.js`, `login-user.usecase.js`: Pequeños wrappers que llaman a `AuthService` y normalizan errores.

- **Tests (`src/__tests__/*`)**:
  - `auth.service.test.js`: Buen coverage conceptual; sin embargo hay pequeñas discrepancias (por ejemplo el test espera "User already exist" mientras el código lanza "User already exists").
  - `user.service.test.js`: archivo inicializado pero incompleto.

## Issues / puntos pendientes (donde te quedaste)

1. `src/services/file.service.js`
   - Mensajes y variables erróneas:
     - `if(existingFiles.length >= limitOfProjects.maxFilesPerProject){ ... (${limits.maxFilesPerProject})`}` -> usa `limits` no definido; la variable correcta es `limitOfProjects`.
     - Mensaje de validación: "Project and path any required" (typo/gramática).
   - Recomendación: corregir variables y mensajes, usar nombres consistentes y probar flujos de límite por rol.

2. `src/controllers/Auth.controller.js`
   - `console.log` usa `name` indefinida: `console.log("...", { email: req.body.email, username:  name })`.

3. `src/controllers/file.controller.js`
   - Falta `import { ServerError } from "../services/Error.service.js"` o ajustar el manejo de errores en los `catch`.

4. `src/controllers/project.controller.js`
   - Llama a `ProjectService.findByTechStack` que no existe. Debería llamar a `ProjectService.getProjectsByTech(tech)` o ajustar el nombre.
   - En `getByOwner` el `catch` solo hace logs y no responde al cliente.

5. `src/controllers/user.controller.js`
   - `updateById` invoca `UserService.updateById` pero en `user.service.js` el método se llama `updateUser`.

6. `src/services/email.service.js`
   - Error de sintaxis en el `catch`: `else({ ... })` no es código válido. Esto rompe la importación del módulo.

7. `src/routes/file.routes.js`
   - Ruta sin slash: `fileRoutes.get("project/:project_id/path", ...)` → añadir `/`.
   - Import de `file.controller` sin `.js` (inconsistencia con el resto del proyecto; puede fallar con `type: "module"`).

8. `src/middlewares/project.middleware.js`
   - Nombre de función `canModifyProjet` con typo. Algunos retornos usan `req.user.getRoleLimits()` sin `await`.

9. `src/routes/project.routes.js`
   - `DELETE /:id` no valida propiedad ni usa `loadProject`/`canModifyProjet`.

10. Tests
   - `auth.service.test.js` espera algunos textos diferentes a los reales (e.g. "User already exist" vs "User already exists"). Corregir expectativas o mensajes de error en el servicio.
   - `user.service.test.js` incompleto.

## Siguientes pasos recomendados
- Corregir errores de sintaxis críticos (ej. `email.service.js`) para que el servidor arranque.
- Arreglar inconsistencias de nombres (métodos y rutas) entre controladores y servicios.
- Añadir `import { ServerError }` donde falte y unificar manejo de errores.
- Ejecutar los tests (`npm test`) y corregir fallos detectados por Jest.
- Revisar y probar endpoints con `supertest` o manualmente tras levantar el servidor.

Si querés, aplico los fixes más críticos (por ejemplo: `email.service.js` y las var/mensajes en `file.service.js`) y dejo los tests verdes. ¿Qué querés que haga primero?
