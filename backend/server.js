const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ruta de diagnóstico
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mensaje: 'Servidor PizzaMásAllá operando correctamente' });
});

// Endpoint para consultar el catálogo de productos (PB-01)
app.get('/api/productos', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM productos WHERE activo = true ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar productos:', error);
        res.status(500).json({ error: 'Error al obtener la lista de productos' });
    }
});

// Endpoint para guardar la venta y su desglose (PB-05 y PB-06)
app.post('/api/ventas', async (req, res) => {
    const { subtotal, total, metodoPago, productos } = req.body;
    
    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: 'No hay productos en la comanda para procesar.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Generar folio único
        const folio = `FOL-${Math.floor(100000 + Math.random() * 900000)}`;

        // 1. Insertar en la tabla ventas
        const resVenta = await client.query(
            `INSERT INTO ventas (folio, subtotal, descuento, total, metodo_pago) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, folio, fecha_registro`,
            [folio, subtotal, 0.00, total, metodoPago]
        );
        const ventaId = resVenta.rows[0].id;

        // 2. Insertar cada artículo en detalle_ventas
        for (const item of productos) {
            await client.query(
                `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [ventaId, item.id, item.cantidad, item.precio, Number(item.precio) * item.cantidad]
            );
        }

        await client.query('COMMIT');
        res.json({
            status: 'exito',
            mensaje: 'Venta registrada con éxito',
            folio: resVenta.rows[0].folio,
            fecha: resVenta.rows[0].fecha_registro
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar la venta:', error);
        res.status(500).json({ error: 'Falla al procesar la venta en la base de datos.' });
    } finally {
        client.release();
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend ejecutándose en el puerto ${PORT}`);
});