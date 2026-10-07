import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../conf/dbConnection';

interface Product extends RowDataPacket {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  brand: string | null;
  img: string | null;
  active: number;
}

interface ProductInput {
  name: string;
  price: number;
  stock: number;
  description: string;
  brand: string | null;
  img: string | null;
}

type IdParams = { id: string };

const PRODUCT_COLUMNS = 'id, name, price, stock, description, brand, img, active';
const MAX_PRICE = 99999999.99; // límite de DECIMAL(10,2)

// ---------- Validaciones ----------

// Devuelve el id como número si es un entero positivo, o null si no es válido
const parseId = (value: string): number | null => {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

// Devuelve un mensaje de error o null si el precio es válido
const validatePrice = (price: unknown): string | null => {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return 'price debe ser un número';
  }
  if (price <= 0) return 'price debe ser mayor que 0';
  if (price > MAX_PRICE) return `price no puede ser mayor que ${MAX_PRICE}`;
  if (Math.abs(price * 100 - Math.round(price * 100)) > 1e-6) {
    return 'price debe tener como máximo 2 decimales';
  }
  return null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isOptionalString = (value: unknown): value is string | null | undefined =>
  value === undefined || value === null || typeof value === 'string';

const validateProductBody = (
  body: unknown,
): { data: ProductInput | null; errors: string[] } => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { data: null, errors: ['El cuerpo debe ser un objeto JSON'] };
  }

  const { name, price, stock, description, brand, img } = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!isNonEmptyString(name)) errors.push('name es obligatorio y debe ser texto');
  const priceError = validatePrice(price);
  if (priceError) errors.push(priceError);
  if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
    errors.push('stock debe ser un entero mayor o igual a 0');
  }
  if (!isNonEmptyString(description)) errors.push('description es obligatorio y debe ser texto');
  if (!isOptionalString(brand)) errors.push('brand debe ser texto');
  if (!isOptionalString(img)) errors.push('img debe ser texto');

  if (errors.length > 0) return { data: null, errors };

  return {
    data: {
      name: (name as string).trim(),
      price: price as number,
      stock: stock as number,
      description: (description as string).trim(),
      brand: (brand as string | null | undefined) ?? null,
      img: (img as string | null | undefined) ?? null,
    },
    errors: [],
  };
};

// ---------- Helpers ----------

const findActiveById = async (id: number): Promise<Product | null> => {
  const [rows] = await pool.query<Product[]>(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ? AND active = ?`,
    [id, true],
  );
  return rows[0] ?? null;
};

// Registra el error real en consola, pero al cliente sólo le manda un mensaje genérico
const handleError = (res: Response, error: unknown): void => {
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor' });
};

const invalidId = (res: Response): void => {
  res.status(400).json({ message: 'El id debe ser un entero positivo' });
};

const notFound = (res: Response): void => {
  res.status(404).json({ message: 'Producto no encontrado' });
};

// ---------- Controladores ----------

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<Product[]>(
      `SELECT ${PRODUCT_COLUMNS} FROM products WHERE active = ?`,
      [true],
    );
    res.status(200).json({ data: rows });
  } catch (error) {
    handleError(res, error);
  }
};

export const getById = async (req: Request<IdParams>, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) return invalidId(res);

  try {
    const product = await findActiveById(id);
    if (!product) return notFound(res);
    res.status(200).json({ data: product });
  } catch (error) {
    handleError(res, error);
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { data, errors } = validateProductBody(req.body);
  if (!data) {
    res.status(400).json({ message: 'Datos inválidos', errors });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.price, data.stock, data.description, data.brand, data.img],
    );
    const product = await findActiveById(result.insertId);
    res.status(201).json({ message: 'Producto creado', data: product });
  } catch (error) {
    handleError(res, error);
  }
};

export const update = async (req: Request<IdParams>, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) return invalidId(res);

  const { data, errors } = validateProductBody(req.body);
  if (!data) {
    res.status(400).json({ message: 'Datos inválidos', errors });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE products
         SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ?
       WHERE id = ? AND active = ?`,
      [data.name, data.price, data.stock, data.description, data.brand, data.img, id, true],
    );
    if (result.affectedRows === 0) return notFound(res);

    const product = await findActiveById(id);
    res.status(200).json({ message: 'Producto actualizado', data: product });
  } catch (error) {
    handleError(res, error);
  }
};

export const remove = async (req: Request<IdParams>, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) return invalidId(res);

  try {
    // Baja lógica: no se borra la fila, sólo se marca como inactiva
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET active = ? WHERE id = ? AND active = ?',
      [false, id, true],
    );
    if (result.affectedRows === 0) return notFound(res);

    res.status(200).json({ message: 'Producto dado de baja' });
  } catch (error) {
    handleError(res, error);
  }
};

export const changePrice = async (req: Request<IdParams>, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  if (id === null) return invalidId(res);

  const body: unknown = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({ message: 'El cuerpo debe ser un objeto JSON con price' });
    return;
  }
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== 'price') {
    res.status(400).json({ message: 'El cuerpo debe contener solamente price' });
    return;
  }
  const { price } = body as { price: unknown };
  const priceError = validatePrice(price);
  if (priceError) {
    res.status(400).json({ message: 'Datos inválidos', errors: [priceError] });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET price = ? WHERE id = ? AND active = ?',
      [price, id, true],
    );
    if (result.affectedRows === 0) return notFound(res);

    const product = await findActiveById(id);
    res.status(200).json({ message: 'Precio actualizado', data: product });
  } catch (error) {
    handleError(res, error);
  }
};
