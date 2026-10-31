-- Usuarios de prueba (1 Cajero, 1 Administrador)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Cajero Principal', 'cajero@pizzamasalla.com', 'hash_password_cajero', 'cajero'),
('Admin General', 'admin@pizzamasalla.com', 'hash_password_admin', 'administrador');

-- Productos iniciales del Menú Vigente (PB-01)
INSERT INTO productos (nombre, descripcion, precio, activo) VALUES
('Pizza Pepperoni Familiar', 'Masa tradicional, salsa de tomate, queso mozzarella y doble pepperoni', 189.00, true),
('Pizza Hawaiana Familiar', 'Masa tradicional, jamón, piña y queso mozzarella', 179.00, true),
('Pizza Mexicana', 'Chorizo, chile jalapeño, cebolla y carne molida', 199.00, true),
('Refresco 2L', 'Coca-Cola 2 Litros', 45.00, true);

-- Promoción de prueba (PB-11, PB-12)
INSERT INTO promociones (nombre, tipo, valor, fecha_inicio, fecha_fin, activa) VALUES
('Descuento Inauguración', 'porcentaje', 10.00, NOW(), NOW() + INTERVAL '30 days', true);