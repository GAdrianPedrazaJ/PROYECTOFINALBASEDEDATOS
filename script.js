// script.js - Funcionalidad principal del sitio (Registro, Inicio de Sesión, Carrito) + Admin
const btnIniciarSesion = document.getElementById('btn-iniciar-sesion');
const btnRegistrarse = document.getElementById('btn-registrarse');
const usuarioNombre = document.getElementById('nombre-usuario');

// ========== MOSTRAR SECCIÓN ==========
function mostrarSeccion(id) {
    document.querySelectorAll('section').forEach(seccion => {
        seccion.style.display = 'none';
    });
    document.getElementById(id).style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== REGISTRO DE USUARIOS ==========
document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registro-form');
    if (registroForm) {
        registroForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = {
                nombre_completo: document.getElementById('nombre').value,
                correo: document.getElementById('gmail').value,
                contrasena: document.getElementById('password').value,
                telefono: document.getElementById('telefono').value,
                fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
                direccion: document.getElementById('direccion').value,
                departamento: document.getElementById('departamento').value,
                ciudad: document.getElementById('ciudad').value,
                codigo_postal: document.getElementById('codigo_postal').value,
                is_admin: false // Por defecto, no es administrador
            };

            try {
                const response = await fetch('http://localhost:3000/api/usuarios/insertar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(result.mensaje);
                    window.location.href = 'index.html';
                } else {
                    const error = await response.json();
                    alert('Error al registrar usuario: ' + error.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor: ' + error.message);
            }
        });
    }

    // ========== INICIO DE SESIÓN DE USUARIOS ==========
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = {
                correo: document.getElementById('usuario').value,
                contrasena: document.getElementById('contrasena').value
            };

            try {
                const response = await fetch('http://localhost:3000/api/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(result.mensaje);
                    localStorage.setItem('usuario', JSON.stringify(result.usuario)); // Guardar info del usuario
                    window.location.href = 'index.html';
                } else {
                    const error = await response.json();
                    alert('Error al iniciar sesión: ' + error.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor: ' + error.message);
            }
        });
    }

    // ========== INICIALIZACIÓN Y CARRITO ==========
    window.scrollTo(0, 0);
    actualizarContadorCarrito();

    document.querySelectorAll(".btn-add-to-cart").forEach(button => {
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
            agregarAlCarrito(producto);
            // Feedback visual
            button.textContent = "✓ Añadido";
            button.style.backgroundColor = "#4CAF50";
            setTimeout(() => {
                button.textContent = "Agregar al carrito";
                button.style.backgroundColor = "";
            }, 2000);
        });
    });

    // ========== VERIFICAR ROL DE USUARIO (ADMIN) ==========
    verificarRolUsuario();

    // Mostrar nombre del usuario si está logueado y ocultar botones de autenticación
    function mostrarNombreUsuario() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario) {
            usuarioNombre.textContent = `Bienvenido, ${usuario.nombre_completo}`;
            usuarioNombre.style.display = 'inline';
            btnIniciarSesion.style.display = 'none';
            btnRegistrarse.style.display = 'none';
        } else {
            usuarioNombre.style.display = 'none';
            btnIniciarSesion.style.display = 'inline';
            btnRegistrarse.style.display = 'inline';
        }
    }
    
    // Llamar a mostrarNombreUsuario al cargar la página
    mostrarNombreUsuario();

    // Marcar "Inicio" como activo por defecto
    const inicioLink = document.querySelector('nav a[onclick="mostrarSeccion(\'inicio\')"]');
    if (inicioLink) {
        inicioLink.classList.add('active');
    }
});

// ========== FUNCIÓN PARA AGREGAR AL CARRITO ==========
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
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
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// ========== FUNCIONES DE ADMINISTRADOR ==========
let currentTable = '';
let currentAction = ''; // 'create' o 'update'
let currentId = '';

function mostrarTabla(tabla) {
    if (!esAdmin()) {
        alert("No tienes permisos para acceder a esta función.");
        return;
    }
    currentTable = tabla;
    cargarDatosTabla(tabla);
    document.getElementById('tabla-container').style.display = 'block';
    document.getElementById('modal-form').style.display = 'none';
}

async function cargarDatosTabla(tabla) {
    try {
        const response = await fetch(`/api/${tabla}/obtener`);
        if (!response.ok) throw new Error('Error al cargar datos');
        const data = await response.json();
        mostrarDatosEnTabla(tabla, data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos de la tabla');
    }
}

function mostrarDatosEnTabla(tabla, data) {
    const tableBody = document.getElementById('tabla-datos');
    tableBody.innerHTML = '';

    data.forEach(row => {
        let tr = document.createElement('tr');
        for (const key in row) {
            let td = document.createElement('td');
            td.textContent = row[key];
            tr.appendChild(td);
        }
        let tdActions = document.createElement('td');
        let btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => abrirModal(tabla, 'update', row.id);

        let btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.onclick = () => eliminarRegistro(tabla, row.id);

        tdActions.appendChild(btnEditar);
        tdActions.appendChild(btnEliminar);
        tr.appendChild(tdActions);
        tableBody.appendChild(tr);
    });
}

function abrirModal(tabla, accion, id = null) {
    if (!esAdmin()) {
        alert("No tienes permisos para acceder a esta función.");
        return;
    }
    currentAction = accion;
    currentId = id;
    document.getElementById('modal-form').style.display = 'block';
    document.getElementById('tabla-container').style.display = 'none';

    const form = document.getElementById('form-modal');
    form.innerHTML = '';

    let campos = obtenerCamposTabla(tabla);

    campos.forEach(campo => {
        let label = document.createElement('label');
        label.textContent = campo.charAt(0).toUpperCase() + campo.slice(1);
        let input = document.createElement('input');
        input.type = 'text';
        input.id = campo;
        input.name = campo;
        form.appendChild(label);
        form.appendChild(input);
    });

    let btnGuardar = document.createElement('button');
    btnGuardar.textContent = accion === 'create' ? 'Crear' : 'Guardar';
    btnGuardar.type = 'submit';
    form.appendChild(btnGuardar);

    let btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.type = 'button';
    btnCancelar.onclick = cerrarModal;
    form.appendChild(btnCancelar);

    if (accion === 'update' && id) {
        cargarDatosFormulario(tabla, id);
    }
}

function cerrarModal() {
    document.getElementById('modal-form').style.display = 'none';
    document.getElementById('tabla-container').style.display = 'block';
}

function obtenerCamposTabla(tabla) {
    const camposTablas = {
        usuarios: ['nombre_completo', 'correo', 'contrasena', 'telefono', 'fecha_nacimiento', 'direccion', 'departamento', 'ciudad', 'codigo_postal', 'is_admin'],
        productos: ['nombre', 'descripcion', 'precio', 'stock', 'imagen_url'],
        pedidos: ['usuario_id', 'fecha_pedido', 'fecha_entrega', 'direccion_envio', 'estado_pedido'],
        items_pedido: ['pedido_id', 'producto_id', 'cantidad', 'precio_unitario'],
        productos_usuarios: ['usuario_id', 'producto_id'],
        mensajes_contacto: ['usuario_id', 'nombre', 'correo', 'mensaje', 'fue_respondido']
    };
    return camposTablas[tabla] || [];
}

async function cargarDatosFormulario(tabla, id) {
    try {
        const response = await fetch(`/api/${tabla}/obtener`);
        if (!response.ok) throw new Error('Error al cargar datos');
        const data = await response.json();
        const registro = data.find(item => item.id === id);
        if (registro) {
            for (const key in registro) {
                const input = document.getElementById(key);
                if (input) {
                    input.value = registro[key];
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos del registro');
    }
}

/*document.getElementById('form-modal').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!esAdmin()) {
        alert("No tienes permisos para realizar esta acción.");
        return;
    }

    const formData = {};
    const formElements = this.elements;
    for (let i = 0; i < formElements.length; i++) {
        if (formElements[i].name) {
            formData[formElements[i].name] = formElements[i].value;
        }
    }

    try {
        let response;
        if (currentAction === 'create') {
            response = await fetch(`/api/${currentTable}/insertar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else if (currentAction === 'update') {
            response = await fetch(`/api/${currentTable}/actualizar/${currentId}`, {
                method: 'PUT',
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
            const error = await response.json();
            alert('Error en la operación: ' + error.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al realizar la operación: ' + error.message);
    }
});*/

async function eliminarRegistro(tabla, id) {
    if (!esAdmin()) {
        alert("No tienes permisos para eliminar registros.");
        return;
    }
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
        const response = await fetch(`/api/${tabla}/eliminar/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Registro eliminado con éxito');
            cargarDatosTabla(tabla);
        } else {
            const error = await response.json();
            alert('Error al eliminar: ' + error.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el registro: ' + error.message);
    }
}

// ========== VERIFICAR ROL DE USUARIO (ADMIN) ==========
function verificarRolUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const adminLink = document.getElementById('admin-link');

    if (adminLink) { // Verifica que el elemento exista
        if (usuario && usuario.is_admin) {
            adminLink.style.display = 'inline-block'; // Muestra el enlace si es admin
        } else {
            adminLink.style.display = 'none'; // Oculta el enlace si no es admin
        }
    }
}

// ========== MOSTRAR NOMBRE DEL USUARIO ==========
function mostrarNombreUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const usuarioNombre = document.getElementById('nombre-usuario'); // Asegúrate de que coincida con el ID en HTML
    const btnIniciarSesion = document.getElementById('btn-iniciar-sesion');
    const btnRegistrarse = document.getElementById('btn-registrarse');
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    if (usuario && usuario.nombre_completo) {
        usuarioNombre.textContent = `Bienvenido, ${usuario.nombre_completo}`;
        usuarioNombre.style.display = 'inline';
        btnIniciarSesion.style.display = 'none';
        btnRegistrarse.style.display = 'none';
        btnCerrarSesion.style.display = 'inline'; // Mostrar botón de cerrar sesión
    } else {
        usuarioNombre.style.display = 'none';
        btnIniciarSesion.style.display = 'inline';
        btnRegistrarse.style.display = 'inline';
        btnCerrarSesion.style.display = 'none'; // Ocultar botón de cerrar sesión
    }
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    mostrarNombreUsuario();
    // Resto del código...
});

// Llamar a mostrarNombreUsuario al cargar la página
//mostrarNombreUsuario();

// Función auxiliar para verificar si el usuario es admin
function esAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    return usuario && usuario.is_admin;
}

// ========== HEADER DINÁMICO (OCULTAR AL HACER SCROLL) ==========
let lastScroll = 0;
const header = document.querySelector('header');
const headerHeight = document.querySelector('header').offsetHeight;

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    // Comprueba si el scroll es suficiente para considerar
    if (Math.abs(currentScroll - lastScroll) < 50) return;
    
    // Oculta el header al hacer scroll hacia abajo
    if (currentScroll > lastScroll && currentScroll > headerHeight) {
        header.classList.remove('show');
        header.classList.add('hide');
    } 
    // Muestra el header al hacer scroll hacia arriba
    else if (currentScroll < lastScroll) {
        header.classList.remove('hide');
        header.classList.add('show');
    }
    
    lastScroll = currentScroll;
});
