CREATE DATABASE IF NOT EXISTS store_db;
USE store_db;

CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  stock       INT           NOT NULL,
  description TEXT          NOT NULL,
  brand       VARCHAR(100)  NULL,
  img         VARCHAR(255)  NULL,
  active      BOOLEAN       NOT NULL DEFAULT TRUE
);

INSERT INTO products (name, price, stock, description, brand, img) VALUES
  ('Mouse inalámbrico', 349.90, 25, 'Mouse óptico inalámbrico 2.4 GHz', 'Logitech', 'https://example.com/mouse.jpg'),
  ('Teclado mecánico', 1299.00, 10, 'Teclado mecánico con switches rojos', 'Redragon', 'https://example.com/teclado.jpg'),
  ('Monitor 24"', 2899.50, 5, 'Monitor IPS Full HD de 24 pulgadas', 'Samsung', NULL);
