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

Importa `products-api.postman_collection.json` en Postman y ejecuta las peticiones en orden.
