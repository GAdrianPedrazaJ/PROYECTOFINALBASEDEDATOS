// script.js - Funciones generales del sitio (versión simplificada)

// ========== MOSTRAR SECCIÓN ==========
function mostrarSeccion(id) {
    // Ocultar todas las secciones
    document.querySelectorAll('section').forEach(function(seccion) {
        seccion.style.display = 'none';
    });
    
    // Mostrar la sección deseada
    document.getElementById(id).style.display = 'block';
    
    // Scroll suave al inicio de la sección
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========== FUNCIÓN PARA ELIMINAR CUENTA ==========
function confirmarEliminarCuenta() {
    var confirmacion = confirm("¿Estás seguro de que deseas eliminar tu cuenta?");
    if (confirmacion) {
        var email = prompt("Por favor, introduce tu correo electrónico:");
        var username = prompt("Por favor, introduce tu nombre de usuario:");
        
        if (email && username) {
            alert("Has solicitado eliminar tu cuenta. Correo electrónico: " + email + ", Nombre de usuario: " + username);
            // Aquí puedes agregar AJAX para enviar la solicitud
        } else {
            alert("Debes proporcionar tanto el correo electrónico como el nombre de usuario para eliminar la cuenta.");
            confirmarEliminarCuenta();
        }
    }
}

// ========== VALIDACIÓN DE FORMULARIOS ==========
$(document).ready(function() {
    var form = $("#form-pedido");

    // Validación de nombre
    $("#nombre").on("input", function() {
        if (!/^[a-zA-Z áéíóúÁÉÍÓÚñÑ]*$/.test($(this).val())) {
            $("#nombre_error").text("Solo letras y espacios permitidos.");
        } else {
            $("#nombre_error").text("");
        }
    });

    // Validación de cédula
    $("#numero_id").on("input", function() {
        if (!/^[0-9]*$/.test($(this).val())) {
            $("#cedula_error").text("Solo números permitidos.");
        } else if ($(this).val().length < 6) {
            $("#cedula_error").text("Mínimo 6 dígitos.");
        } else {
            $("#cedula_error").text("");
        }
    });

    // Validación de celular
    $("#celular").on("input", function() {
        if (!/^[0-9]{10}$/.test($(this).val())) {
            $("#celular_error").text("Debe tener 10 dígitos.");
        } else {
            $("#celular_error").text("");
        }
    });

    // Validación de cantidad
    $("#cantidad").on("input", function() {
        if (!/^[0-9]*$/.test($(this).val())) {
            $("#cantidad_error").text("Solo números enteros.");
        } else if (parseInt($(this).val()) < 1) {
            $("#cantidad_error").text("Mínimo 1 unidad.");
        } else {
            $("#cantidad_error").text("");
        }
    });

    // Validación al enviar formulario
    form.on("submit", function(e) {
        let hasErrors = false;
        
        // Validar campos vacíos
        form.find('input[required]').each(function() {
            if (!$(this).val()) {
                $(this).next('.error-message').text("Este campo es obligatorio.");
                hasErrors = true;
            }
        });
        
        // Verificar otros errores
        if ($("#nombre_error").text() || $("#cedula_error").text() || 
            $("#celular_error").text() || $("#cantidad_error").text()) {
            hasErrors = true;
        }
        
        if (hasErrors) {
            e.preventDefault();
            alert("Por favor corrige los errores antes de enviar.");
        }
    });

    // ========== MANEJO DEL CARRITO ==========
    // Eventos para botones "Agregar al carrito"
    document.querySelectorAll(".btn-add-to-cart").forEach(function(button) {
        button.addEventListener("click", function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-tienda');
            const producto = {
                id: productCard.dataset.productId || Date.now().toString(),
                nombre: productCard.querySelector('.product-title').textContent,
                precio: productCard.querySelector('.product-price').textContent,
                imagen: productCard.querySelector('img').src,
                tipo: 'personal',
                cantidad: 1
            };
            
            if (typeof agregarAlCarrito === 'function') {
                agregarAlCarrito(producto);
                // Feedback visual
                button.textContent = "✓ Añadido";
                button.style.backgroundColor = "#4CAF50";
                setTimeout(() => {
                    button.textContent = "Agregar al carrito";
                    button.style.backgroundColor = "";
                }, 2000);
            } else {
                console.error("La función agregarAlCarrito no está disponible");
                alert("Producto añadido al carrito");
            }
        });
    });
});

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Scroll al inicio al cargar la página
    window.scrollTo(0, 0);
    
    // Inicializar tooltips (si los hay)
    $('[data-toggle="tooltip"]').tooltip();
});

// ========== FUNCIÓN PARA AGREGAR AL CARRITO ==========
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push(producto);
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    return carrito;
}

// ========== ACTUALIZAR CONTADOR DEL CARRITO ==========
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
    
    // Actualizar el contador en la interfaz
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Llamar a la función al cargar la página
actualizarContadorCarrito();

//const { data: { user } } = await supabase.auth.getUser();
//const isAdmin = user?.user_metadata?.is_admin || false;

// ========== FUNCIONES DE ADMINISTRADOR ==========
let currentTable = '';
let currentAction = ''; // 'create' o 'update'
let currentId = '';

// Mostrar tabla específica
function mostrarTabla(tabla) {
    document.querySelectorAll('.admin-table-container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById(`tabla-${tabla}`).style.display = 'block';
    currentTable = tabla;
    
    // Cargar datos de la tabla
    cargarDatosTabla(tabla);
}

// Cargar datos de una tabla
async function cargarDatosTabla(tabla) {
    try {
        const response = await fetch(`/api/admin/${tabla}`);
        const data = await response.json();
        
        const tbody = document.getElementById(`${tabla}-body`);
        tbody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            
            // Generar celdas según la tabla
            switch(tabla) {
                case 'usuarios':
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.correo}</td>
                        <td>${item.nombre_completo || '-'}</td>
                        <td>${item.telefono || '-'}</td>
                        <td>${item.direccion || '-'}</td>
                        <td>${new Date(item.fecha_creacion).toLocaleString()}</td>
                        <td>
                            <button class="btn-editar" onclick="editarRegistro('${tabla}', '${item.id}')">Editar</button>
                            <button class="btn-eliminar" onclick="eliminarRegistro('${tabla}', '${item.id}')">Eliminar</button>
                        </td>
                    `;
                    break;
                    
                case 'productos':
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.nombre}</td>
                        <td>$${item.precio.toFixed(2)}</td>
                        <td>${item.stock}</td>
                        <td>${new Date(item.fecha_creacion).toLocaleString()}</td>
                        <td>
                            <button class="btn-editar" onclick="editarRegistro('${tabla}', '${item.id}')">Editar</button>
                            <button class="btn-eliminar" onclick="eliminarRegistro('${tabla}', '${item.id}')">Eliminar</button>
                        </td>
                    `;
                    break;
                    
                case 'pedidos':
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.usuario_id}</td>
                        <td>$${item.monto_total.toFixed(2)}</td>
                        <td>${item.estado}</td>
                        <td>${item.direccion_envio || '-'}</td>
                        <td>${new Date(item.fecha_creacion).toLocaleString()}</td>
                        <td>
                            <button class="btn-editar" onclick="editarRegistro('${tabla}', '${item.id}')">Editar</button>
                            <button class="btn-eliminar" onclick="eliminarRegistro('${tabla}', '${item.id}')">Eliminar</button>
                        </td>
                    `;
                    break;
                    
                case 'items_pedido':
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.pedido_id}</td>
                        <td>${item.producto_id || '-'}</td>
                        <td>${item.cantidad}</td>
                        <td>$${item.precio_unitario.toFixed(2)}</td>
                        <td>${new Date(item.fecha_creacion).toLocaleString()}</td>
                        <td>
                            <button class="btn-editar" onclick="edrirRegistro('${tabla}', '${item.id}')">Editar</button>
                            <button class="btn-eliminar" onclick="eliminarRegistro('${tabla}', '${item.id}')">Eliminar</button>
                        </td>
                    `;
                    break;
                    
                case 'productos_usuarios':
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.usuario_id}</td>
                        <td>${item.producto_id || '-'}</td>
                        <td>${item.pedido_id || '-'}</td>
                        <td>${new Date(item.fecha_compra).toLocaleString()}</td>
                        <td>${item.cantidad}</td>
                        <td>$${item.precio_unitario.toFixed(2)}</td>
                        <td>${item.estado}</td>
                        <td>
                            <button class="btn-editar" onclick="editarRegistro('${tabla}', '${item.id}')">Editar</button>
                        </td>
                    `;
                    break;
                    
                case 'mensajes_contacto':
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.usuario_id || '-'}</td>
                        <td>${item.nombre}</td>
                        <td>${item.correo}</td>
                        <td>${item.mensaje.substring(0, 30)}${item.mensaje.length > 30 ? '...' : ''}</td>
                        <td>${new Date(item.fecha_creacion).toLocaleString()}</td>
                        <td>${item.fue_respondido ? 'Sí' : 'No'}</td>
                        <td>
                            <button class="btn-editar" onclick="editarRegistro('${tabla}', '${item.id}')">Ver/Responder</button>
                        </td>
                    `;
                    break;
            }
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar datos');
    }
}

// Abrir modal para crear/editar
function abrirModal(tabla, id = null) {
    currentTable = tabla;
    currentAction = id ? 'update' : 'create';
    currentId = id || '';
    
    const modal = document.getElementById('admin-modal');
    const title = document.getElementById('modal-title');
    const formContent = document.getElementById('modal-form-content');
    
    // Configurar título
    title.textContent = id ? `Editar ${tabla}` : `Agregar nuevo ${tabla}`;
    
    // Configurar formulario según la tabla
    let formFields = '';
    
    switch(tabla) {
        case 'usuarios':
            formFields = `
                <div class="form-group">
                    <label for="correo">Correo:</label>
                    <input type="email" id="correo" name="correo" required>
                </div>
                <div class="form-group">
                    <label for="nombre_completo">Nombre Completo:</label>
                    <input type="text" id="nombre_completo" name="nombre_completo">
                </div>
                <div class="form-group">
                    <label for="telefono">Teléfono:</label>
                    <input type="text" id="telefono" name="telefono">
                </div>
                <div class="form-group">
                    <label for="direccion">Dirección:</label>
                    <input type="text" id="direccion" name="direccion">
                </div>
            `;
            break;
            
        case 'productos':
            formFields = `
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" required>
                </div>
                <div class="form-group">
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" name="precio" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="stock">Stock:</label>
                    <input type="number" id="stock" name="stock" min="0" required>
                </div>
            `;
            break;
            
        case 'pedidos':
            formFields = `
                <div class="form-group">
                    <label for="usuario_id">Usuario ID:</label>
                    <input type="text" id="usuario_id" name="usuario_id" required>
                </div>
                <div class="form-group">
                    <label for="monto_total">Monto Total:</label>
                    <input type="number" id="monto_total" name="monto_total" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado" name="estado" required>
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="direccion_envio">Dirección de Envío:</label>
                    <textarea id="direccion_envio" name="direccion_envio" rows="3"></textarea>
                </div>
            `;
            break;
            
        case 'items_pedido':
            formFields = `
                <div class="form-group">
                    <label for="pedido_id">Pedido ID:</label>
                    <input type="text" id="pedido_id" name="pedido_id" required>
                </div>
                <div class="form-group">
                    <label for="producto_id">Producto ID:</label>
                    <input type="number" id="producto_id" name="producto_id" min="1">
                </div>
                <div class="form-group">
                    <label for="cantidad">Cantidad:</label>
                    <input type="number" id="cantidad" name="cantidad" min="1" required>
                </div>
                <div class="form-group">
                    <label for="precio_unitario">Precio Unitario:</label>
                    <input type="number" id="precio_unitario" name="precio_unitario" step="0.01" min="0" required>
                </div>
            `;
            break;
            
        case 'productos_usuarios':
            formFields = `
                <div class="form-group">
                    <label for="usuario_id">Usuario ID:</label>
                    <input type="text" id="usuario_id" name="usuario_id" required>
                </div>
                <div class="form-group">
                    <label for="producto_id">Producto ID:</label>
                    <input type="number" id="producto_id" name="producto_id" min="1">
                </div>
                <div class="form-group">
                    <label for="pedido_id">Pedido ID:</label>
                    <input type="text" id="pedido_id" name="pedido_id">
                </div>
                <div class="form-group">
                    <label for="cantidad">Cantidad:</label>
                    <input type="number" id="cantidad" name="cantidad" min="1" required>
                </div>
                <div class="form-group">
                    <label for="precio_unitario">Precio Unitario:</label>
                    <input type="number" id="precio_unitario" name="precio_unitario" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <select id="estado" name="estado" required>
                        <option value="pendiente">Pendiente</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
            `;
            break;
            
        case 'mensajes_contacto':
            formFields = `
                <div class="form-group">
                    <label for="usuario_id">Usuario ID (opcional):</label>
                    <input type="text" id="usuario_id" name="usuario_id">
                </div>
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" required>
                </div>
                <div class="form-group">
                    <label for="correo">Correo:</label>
                    <input type="email" id="correo" name="correo" required>
                </div>
                <div class="form-group">
                    <label for="mensaje">Mensaje:</label>
                    <textarea id="mensaje" name="mensaje" rows="5" required></textarea>
                </div>
                <div class="form-group">
                    <label for="fue_respondido">Respondido:</label>
                    <select id="fue_respondido" name="fue_respondido">
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                    </select>
                </div>
            `;
            break;
    }
    
    formContent.innerHTML = formFields;
    
    // Si es edición, cargar los datos
    if (id) {
        cargarDatosParaEdicion(tabla, id);
    }
    
    modal.style.display = 'block';
}

// Cargar datos para edición
async function cargarDatosParaEdicion(tabla, id) {
    try {
        const response = await fetch(`/api/admin/${tabla}/${id}`);
        const data = await response.json();
        
        // Llenar el formulario con los datos
        for (const key in data) {
            const input = document.getElementById(key);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = data[key];
                } else {
                    input.value = data[key];
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar datos para edición:', error);
        alert('Error al cargar datos para edición');
    }
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('admin-modal').style.display = 'none';
    document.getElementById('admin-form').reset();
}

// Manejar envío del formulario
document.getElementById('admin-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {};
    const inputs = this.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type !== 'button' && input.type !== 'submit') {
            formData[input.name] = input.type === 'checkbox' ? input.checked : input.value;
        }
    });
    
    try {
        let response;
        const url = `/api/admin/${currentTable}` + (currentAction === 'update' ? `/${currentId}` : '');
        
        if (currentAction === 'update') {
            response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            alert('Operación realizada con éxito');
            cerrarModal();
            cargarDatosTabla(currentTable);
        } else {
            throw new Error('Error en la operación');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al realizar la operación');
    }
});

// Eliminar registro
async function eliminarRegistro(tabla, id) {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
        const response = await fetch(`/api/admin/${tabla}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Registro eliminado con éxito');
            cargarDatosTabla(tabla);
        } else {
            throw new Error('Error al eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el registro');
    }
}

// Verificar si el usuario es admin al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Aquí deberías implementar la lógica para verificar si el usuario es admin
    // Por ahora lo dejamos siempre visible para propósitos de desarrollo
    const esAdmin = true; // Cambiar por tu lógica de autenticación
    
    if (esAdmin) {
        document.getElementById('admin-link').style.display = 'inline-block';
    }
});