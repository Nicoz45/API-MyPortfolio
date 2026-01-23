### Step by step guide to creating an API.

* General point: Connect to the data base in mongoDB or MySQL, or whatever you use. In the config folder

1. Create a Schemes with Mongoose in the models folder. (Install Mongoose).
2. Create the repositories corresponding to the schemas with their corresponding CRUD operations.
3. Create the routes folder where the endpoint will be located through which users will be able to make queries to my server.


¿Que es un Use Case?
Un Use Case (caso de uso) representa una accion concreta que un usuario puede hacer en tu sistema.

- Ejemplos:
    1) Registrar un usuario.
    2) Iniciar sesion
    3) Verificar email
    4) Crear una orden 
    5) Pagar una suscripcion

No es tecnico, es negocio.

¿Para que sirve?
1. Orquestar:
    - Coordina varios servicios para cumplir UNA accion del negocio.
    *Registrar usuario* = 
        - validar email
        - crear usuario
        - generar token
        - enviar mail
Todo eso en un solo caso de uso(UseCase)

2. Manejar errores globales
- El controller no deberia decidir que hacer si falla mongo, jwt o gmail.
- El Use Case si

3. Aislar el negocio del framework
Tu logica:
    - No sabe que es express
    - no sabe que es req o res.
    - no sabe si mañana usas Fastify, Nest o AWS Lambda.

Use Case ---> Orquesta + maneha errores + controla el flujo.

# Analogia rapida: (empresa)
- Controller --> Recepcionista
- Use Case --> Jefe de area
- Service --> Especialistas
- Repository --> Archivo/Base de datos

El recepcionista no decide, el jefe si.

## Regla de oro
Controller --> Use Case --> Services --> Repositories