const express = require('express');
const cors = require('cors');
const client = require('./db'); // Ajusta la ruta si es necesario
// const bcrypt = require('bcrypt'); // Comentado porque no se usará
// const saltRounds = 10; // No se necesita

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Whitelist de tablas permitidas (si quieres mantener control de tablas)
const TABLAS_PERMITIDAS = [
  'usuarios',
  'productos',
  'pedidos',
  'items_pedido',
  'productos_usuarios',
  'mensajes_contacto'
];

const validarTabla = (req, res, next) => {
  const { tabla } = req.params;
  if (!TABLAS_PERMITIDAS.includes(tabla)) {
    return res.status(400).json({ 
      success: false,
      error: 'Tabla no permitida' 
    });
  }
  next();
};

// ------------------ RUTAS PARA USUARIOS ------------------
app.post('/api/usuarios/insertar', async (req, res) => {
  const { nombre_completo, correo, contrasena, telefono, fecha_nacimiento, direccion, departamento, ciudad, codigo_postal, is_admin } = req.body;

  // Validación básica
  if (!nombre_completo || !correo || !contrasena || !telefono || !fecha_nacimiento || 
      !direccion || !departamento || !ciudad || !codigo_postal) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
      const query = `
          INSERT INTO usuarios (nombre_completo, correo, contrasena, telefono, fecha_nacimiento, 
                               direccion, departamento, ciudad, codigo_postal, is_admin)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
      `;
      const result = await client.query(query, [
          nombre_completo, 
          correo, 
          contrasena, 
          telefono.toString(), // Asegurar que es string
          fecha_nacimiento, 
          direccion, 
          departamento, 
          ciudad, 
          codigo_postal.toString(), // Asegurar que es string
          is_admin || false
      ]);

      res.status(201).json({ 
          mensaje: 'Usuario creado con éxito',
          usuarioId: result.rows[0].id 
      });

  } catch (error) {
      console.error('Error al registrar usuario:', error);
      
      // Manejar error de correo duplicado
      if (error.code === '23505' && error.constraint === 'usuarios_correo_key') {
          return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }
      
      res.status(500).json({ 
          error: 'Error al registrar usuario',
          detalle: error.message 
      });
  }
});


app.get('/api/usuarios/obtener', (req, res) => {
  client.query('SELECT id, nombre_completo, correo, telefono, fecha_nacimiento, direccion, departamento, ciudad, codigo_postal, is_admin FROM usuarios')
      .then(result => res.status(200).json(result.rows))
      .catch(err => res.status(500).json({ error: err.message }));
});


app.put('/api/usuarios/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_completo, correo, telefono, direccion } = req.body;
  const query = `
      UPDATE usuarios
      SET nombre_completo=$1, correo=$2, telefono=$3, direccion=$4
      WHERE id=$5
  `;
  client.query(query, [nombre_completo, correo, telefono, direccion, id])
      .then(result => {
          if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
          res.status(200).json({ mensaje: 'Usuario actualizado' });
      })
      .catch(err => res.status(500).json({ error: err.message }));
});


app.delete('/api/usuarios/eliminar/:id', (req, res) => {
  client.query('DELETE FROM usuarios WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ mensaje: 'Usuario eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// index.js
app.post('/api/usuarios/login', async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const result = await client.query(
            'SELECT id, nombre_completo, correo, is_admin FROM usuarios WHERE correo = $1 AND contrasena = $2',
            [correo, contrasena] // ¡Importante: En producción, NUNCA almacenes contraseñas sin hashear!
        );

        if (result.rows.length > 0) {
            const usuario = result.rows[0];
            res.status(200).json({ 
                success: true, 
                mensaje: 'Inicio de sesión exitoso', 
                usuario: { 
                    id: usuario.id, 
                    nombre_completo: usuario.nombre_completo,
                    correo: usuario.correo,
                    is_admin: usuario.is_admin 
                } 
            });
        } else {
            res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
    }
});

// ------------------ RUTAS PARA PRODUCTOS ------------------
app.post('/api/productos/insertar', (req, res) => {
  const { nombre, descripcion, precio, stock, imagen_url } = req.body;
  const query = `
    INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url)
    VALUES ($1, $2, $3, $4, $5)
  `;
  client.query(query, [nombre, descripcion, precio, stock, imagen_url])
    .then(() => res.status(201).json({ mensaje: 'Producto creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/productos/obtener', (req, res) => {
  client.query('SELECT * FROM productos')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/api/productos/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock } = req.body;
  const query = `
    UPDATE productos
    SET nombre=$1, descripcion=$2, precio=$3, stock=$4
    WHERE id=$5
  `;
  client.query(query, [nombre, descripcion, precio, stock, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
      res.status(200).json({ mensaje: 'Producto actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/api/productos/eliminar/:id', (req, res) => {
  client.query('DELETE FROM productos WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
      res.status(200).json({ mensaje: 'Producto eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ------------------ RUTAS PARA PEDIDOS ------------------
app.post('/api/pedidos/insertar', (req, res) => {
  const { usuario_id, nombre_cliente, tipo_documento_id, numero_documento, direccion_entrega, departamento, ciudad, celular, metodo_pago_id, monto_total } = req.body;
  const query = `
    INSERT INTO pedidos (usuario_id, nombre_cliente, tipo_documento_id, numero_documento, direccion_entrega, departamento, ciudad, celular, metodo_pago_id, monto_total)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  client.query(query, [usuario_id, nombre_cliente, tipo_documento_id, numero_documento, direccion_entrega, departamento, ciudad, celular, metodo_pago_id, monto_total])
    .then(() => res.status(201).json({ mensaje: 'Pedido creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/pedidos/obtener', (req, res) => {
  client.query('SELECT * FROM pedidos')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/api/pedidos/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { usuario_id, nombre_cliente, tipo_documento_id, numero_documento, direccion_entrega, departamento, ciudad, celular, metodo_pago_id, monto_total, estado } = req.body;
  const query = `
    UPDATE pedidos
    SET usuario_id=$1, nombre_cliente=$2, tipo_documento_id=$3, numero_documento=$4, direccion_entrega=$5, departamento=$6, ciudad=$7, celular=$8, metodo_pago_id=$9, monto_total=$10, estado=$11
    WHERE id=$12
  `;
  client.query(query, [usuario_id, nombre_cliente, tipo_documento_id, numero_documento, direccion_entrega, departamento, ciudad, celular, metodo_pago_id, monto_total, estado, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      res.status(200).json({ mensaje: 'Pedido actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/api/pedidos/eliminar/:id', (req, res) => {
  client.query('DELETE FROM pedidos WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      res.status(200).json({ mensaje: 'Pedido eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ------------------ RUTAS PARA ITEMS_PEDIDO ------------------
app.post('/api/items_pedido/insertar', (req, res) => {
  const { pedido_id, producto_id, cantidad, precio_unitario } = req.body;
  const query = `
    INSERT INTO items_pedido (pedido_id, producto_id, cantidad, precio_unitario)
    VALUES ($1, $2, $3, $4)
  `;
  client.query(query, [pedido_id, producto_id, cantidad, precio_unitario])
    .then(() => res.status(201).json({ mensaje: 'Item en pedido creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/items_pedido/obtener', (req, res) => {
  client.query('SELECT * FROM items_pedido')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/api/items_pedido/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { pedido_id, producto_id, cantidad, precio_unitario } = req.body;
  const query = `
    UPDATE items_pedido
    SET pedido_id=$1, producto_id=$2, cantidad=$3, precio_unitario=$4
    WHERE id=$5
  `;
  client.query(query, [pedido_id, producto_id, cantidad, precio_unitario, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Item no encontrado' });
      res.status(200).json({ mensaje: 'Item actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/api/items_pedido/eliminar/:id', (req, res) => {
  client.query('DELETE FROM items_pedido WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Item no encontrado' });
      res.status(200).json({ mensaje: 'Item eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ------------------ RUTAS PARA PRODUCTOS_USUARIOS ------------------
app.post('/api/productos_usuarios/insertar', (req, res) => {
  const { usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado } = req.body;
  const query = `
    INSERT INTO productos_usuarios (usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  client.query(query, [usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado])
    .then(() => res.status(201).json({ mensaje: 'Producto de usuario creado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/productos_usuarios/obtener', (req, res) => {
  client.query('SELECT * FROM productos_usuarios')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/api/productos_usuarios/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado } = req.body;
  const query = `
    UPDATE productos_usuarios
    SET usuario_id=$1, producto_id=$2, pedido_id=$3, cantidad=$4, precio_unitario=$5, estado=$6
    WHERE id=$7
  `;
  client.query(query, [usuario_id, producto_id, pedido_id, cantidad, precio_unitario, estado, id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Producto de usuario no encontrado' });
      res.status(200).json({ mensaje: 'Producto de usuario actualizado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/api/productos_usuarios/eliminar/:id', (req, res) => {
  client.query('DELETE FROM productos_usuarios WHERE id=$1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Producto de usuario no encontrado' });
      res.status(200).json({ mensaje: 'Producto de usuario eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ------------------ RUTAS PARA MENSAJES_CONTACTO ------------------
app.post('/api/mensajes_contacto/insertar', (req, res) => {
  const { usuario_id, nombre, correo, mensaje } = req.body;
  const query = `
    INSERT INTO mensajes_contacto (usuario_id, nombre, correo, mensaje)
    VALUES ($1, $2, $3, $4)
  `;
  client.query(query, [usuario_id, nombre, correo, mensaje])
    .then(() => res.status(201).json({ mensaje: 'Mensaje enviado' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/mensajes_contacto/obtener', (req, res) => {
  client.query('SELECT * FROM mensajes_contacto')
    .then(result => res.status(200).json(result.rows))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/api/mensajes_contacto/responder/:id', (req, res) => {
  client.query(
    'UPDATE mensajes_contacto SET fue_respondido = TRUE WHERE id = $1',
    [req.params.id]
  )
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
      res.status(200).json({ mensaje: 'Mensaje marcado como respondido' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/api/mensajes_contacto/eliminar/:id', (req, res) => {
  client.query('DELETE FROM mensajes_contacto WHERE id = $1', [req.params.id])
    .then(result => {
      if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
      res.status(200).json({ mensaje: 'Mensaje eliminado' });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ------------------ INICIAR SERVIDOR ------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
