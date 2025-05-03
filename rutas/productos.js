const express = require('express');
const router = express.Router();
const client = require('../bd');

// Crear un producto
router.post('/insertar', (req, res) => {
  const { nombre, precio, stock } = req.body;
  const query = `
    INSERT INTO productos (nombre, precio, stock)
    VALUES ($1, $2, $3)
  `;
  client.query(query, [nombre, precio, stock])
    .then(() => res.status(201).json({ mensaje: 'Producto creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Obtener todos los productos
router.get('/obtener', (req, res) => {
  client.query('SELECT * FROM productos')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Actualizar un producto
router.put('/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  const query = `
    UPDATE productos
    SET nombre=$1, precio=$2, stock=$3
    WHERE id=$4
  `;
  client.query(query, [nombre, precio, stock, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
      res.status(200).json({ mensaje: 'Producto actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// Eliminar un producto
router.delete('/eliminar/:id', (req, res) => {
  client.query('DELETE FROM productos WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
      res.status(200).json({ mensaje: 'Producto eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;


