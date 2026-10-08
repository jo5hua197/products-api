# Products API — Express + TypeScript + MySQL2

API REST de productos con baja lógica.

## Cómo correrlo

1. Ejecuta `database.sql` en MySQL (crea `store_db`, la tabla `products` y 3 productos de ejemplo).
2. Copia `.env.example` a `.env` y pon tus credenciales.
3. `npm install`
4. `npm run dev`: modo desarrollo con recarga automática.

Otros scripts: `npm run build` compila a `dist/` y `npm start` corre la versión compilada.

## Endpoints (`/api/v1/products`)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/getAll` | Productos activos |
| GET | `/getById/:id` | Un producto activo |
| POST | `/create` | Crea un producto (201) |
| PUT | `/update/:id` | Actualiza todos los datos |
| DELETE | `/delete/:id` | Baja lógica (`active = FALSE`) |
| PATCH | `/change-price/:id` | Cambia solo el precio |

Cuerpo de POST/PUT:

```json
{
  "name": "Audífonos Bluetooth",
  "price": 599.99,
  "stock": 15,
  "description": "Audífonos inalámbricos",
  "brand": "Sony",
  "img": "https://example.com/audifonos.jpg"
}
```

Cuerpo de PATCH: `{ "price": 699.90 }`

## Evidencia

Capturas de Thunder Client en la carpeta [`evidencias/`](evidencias):

| # | Petición | Resultado | Captura |
| --- | --- | --- | --- |
| 1 | `GET /getAll` | 200, productos activos | [01-getAll.png](evidencias/01-getAll.png) |
| 1 | `GET /getById/1` | 200, producto activo | [02-getById.png](evidencias/02-getById.png) |
| 2 | `POST /create` | 201, producto creado (id 4) | [03-create.png](evidencias/03-create.png) |
| 3 | `PUT /update/4` | 200, actualización completa | [04-update.png](evidencias/04-update.png) |
| 3 | `PATCH /change-price/4` | 200, precio actualizado | [05-change-price.png](evidencias/05-change-price.png) |
| 4 | `DELETE /delete/4` | 200, baja lógica | [06-delete.png](evidencias/06-delete.png) |
| 5 | `GET /getAll` | 200, ya no aparece el id 4 | [07-getAll-sin-baja.png](evidencias/07-getAll-sin-baja.png) |
| 5 | `GET /getById/4` | 404, producto dado de baja | [08-getById-baja.png](evidencias/08-getById-baja.png) |
| 6 | `GET /getById/99999` | 404, ID inexistente | [09-id-inexistente.png](evidencias/09-id-inexistente.png) |
| 6 | `POST /create` (datos inválidos) | 400, errores de validación | [10-datos-invalidos.png](evidencias/10-datos-invalidos.png) |

También se incluye `products-api.postman_collection.json`, que se puede importar en Postman o Thunder Client.
