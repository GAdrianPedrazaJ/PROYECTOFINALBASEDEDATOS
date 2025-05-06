// script.js - Funcionalidad completa para ManillaNia (Registro, Login, Carrito y Admin)

// ========== VARIABLES GLOBALES ==========
const btnIniciarSesion = document.getElementById('btn-iniciar-sesion');
const btnRegistrarse = document.getElementById('btn-registrarse');
const usuarioNombre = document.getElementById('nombre-usuario');
let currentTable = '';
let currentAction = '';
let currentId = '';

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    inicializarEventos();
    actualizarContadorCarrito();
});

// ========== FUNCIONES PRINCIPALES ==========
function verificarSesion() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        usuarioNombre.textContent = `Bienvenido, ${usuario.nombre_completo}`;
        usuarioNombre.style.display = 'inline';
        if (btnIniciarSesion) btnIniciarSesion.style.display = 'none';
        if (btnRegistrarse) btnRegistrarse.style.display = 'none';
        
        // Mostrar enlace de admin si es administrador
        if (usuario.is_admin) {
            const adminLink = document.querySelector('a[onclick*="administrador"]');
            if (adminLink) adminLink.style.display = 'inline-block';
        }
    }
}

function inicializarEventos() {
    // Registro
    const registroForm = document.getElementById('registro-form');
    if (registroForm) {
        registroForm.addEventListener('submit', registrarUsuario);
    }

    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', iniciarSesion);
    }

    // Carrito
    document.querySelectorAll(".btn-add-to-cart").forEach(button => {
        button.addEventListener("click", agregarProductoAlCarrito);
    });

    // Admin (solo si existe el formulario)
    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
        adminForm.addEventListener('submit', manejarFormularioAdmin);
    }
}

// ========== AUTENTICACIÓN ==========
async function registrarUsuario(e) {
    e.preventDefault();
    
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
        is_admin: false
    };

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/insertar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        alert(result.mensaje || 'Registro exitoso');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar: ' + error.message);
    }
}

async function iniciarSesion(e) {
    e.preventDefault();
    
    const formData = {
        correo: document.getElementById('usuario').value,
        contrasena: document.getElementById('contrasena').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('usuario', JSON.stringify(result.usuario));
            alert('Inicio de sesión exitoso');
            window.location.href = 'index.html';
        } else {
            const error = await response.json();
            alert(error.error || 'Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
}

// ========== CARRITO DE COMPRAS ==========
function agregarProductoAlCarrito(e) {
    e.preventDefault();
    const productCard = this.closest('.product-tienda');
    const producto = {
        id: productCard.dataset.productId || Date.now().toString(),
        nombre: productCard.querySelector('.product-title').textContent,
        precio: productCard.querySelector('.product-price').textContent,
        imagen: productCard.querySelector('img').src,
        cantidad: 1
    };

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existe = carrito.find(item => item.id === producto.id);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push(producto);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    
    // Feedback visual
    this.textContent = "✓ Añadido";
    this.style.backgroundColor = "#4CAF50";
    setTimeout(() => {
        this.textContent = "Agregar al carrito";
        this.style.backgroundColor = "";
    }, 2000);
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const contador = document.getElementById('contador-carrito');
    
    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// ========== ADMINISTRADOR ==========
function mostrarTabla(tabla) {
    if (!esAdmin()) {
        alert("Acceso denegado: Se requieren permisos de administrador");
        return;
    }

    // Oculta todas las tablas
    document.querySelectorAll('.admin-table-container').forEach(t => {
        t.style.display = 'none';
    });

    // Muestra la tabla seleccionada
    const tablaMostrar = document.getElementById(`tabla-${tabla}`);
    if (tablaMostrar) tablaMostrar.style.display = 'block';
    
    currentTable = tabla;
    cargarDatosTabla(tabla);
}

async function cargarDatosTabla(tabla) {
    try {
        const response = await fetch(`/api/${tabla}/obtener`);
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const data = await response.json();
        mostrarDatosEnTabla(tabla, data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos: ' + error.message);
    }
}

function mostrarDatosEnTabla(tabla, data) {
    const tbody = document.getElementById(`${tabla}-body`);
    if (!tbody) return;

    tbody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        
        // Agrega celdas con datos
        for (const key in item) {
            const cell = document.createElement('td');
            cell.textContent = item[key];
            row.appendChild(cell);
        }

        // Agrega botones de acción
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <button class="btn-editar" onclick="abrirModal('${tabla}', 'update', '${item.id}')">Editar</button>
            <button class="btn-eliminar" onclick="eliminarRegistro('${tabla}', '${item.id}')">Eliminar</button>
        `;
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

function abrirModal(tabla, accion, id = null) {
    if (!esAdmin()) return;

    currentAction = accion;
    currentId = id;
    
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'block';

    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.textContent = accion === 'create' ? 
            `Agregar ${tabla}` : `Editar ${tabla}`;
    }

    // Configura campos del formulario
    const formContent = document.getElementById('modal-form-content');
    if (formContent) {
        formContent.innerHTML = '';
        const campos = obtenerCamposTabla(tabla);
        
        campos.forEach(campo => {
            const div = document.createElement('div');
            div.className = 'campo-admin';
            
            const label = document.createElement('label');
            label.textContent = campo.charAt(0).toUpperCase() + campo.slice(1);
            
            const input = document.createElement('input');
            input.type = 'text';
            input.name = campo;
            input.required = true;
            
            div.appendChild(label);
            div.appendChild(input);
            formContent.appendChild(div);
        });

        // Si es edición, carga los datos
        if (accion === 'update' && id) {
            cargarDatosFormulario(tabla, id);
        }
    }
}

async function cargarDatosFormulario(tabla, id) {
    try {
        const response = await fetch(`/api/${tabla}/obtener`);
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const data = await response.json();
        const registro = data.find(item => item.id == id);
        
        if (registro) {
            for (const key in registro) {
                const input = document.querySelector(`#admin-form [name="${key}"]`);
                if (input) input.value = registro[key];
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos del registro');
    }
}

async function manejarFormularioAdmin(e) {
    e.preventDefault();
    
    if (!esAdmin()) {
        alert("Acceso denegado: Se requieren permisos de administrador");
        return;
    }

    const formData = {};
    const formElements = e.target.elements;
    for (let i = 0; i < formElements.length; i++) {
        if (formElements[i].name) {
            formData[formElements[i].name] = formElements[i].value;
        }
    }

    try {
        let response;
        const url = currentAction === 'create' ? 
            `/api/${currentTable}/insertar` : 
            `/api/${currentTable}/actualizar/${currentId}`;

        response = await fetch(url, {
            method: currentAction === 'create' ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Operación exitosa');
            cerrarModal();
            cargarDatosTabla(currentTable);
        } else {
            const error = await response.json();
            alert('Error: ' + (error.error || 'Operación fallida'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en la conexión: ' + error.message);
    }
}

async function eliminarRegistro(tabla, id) {
    if (!esAdmin() || !confirm('¿Confirmas que deseas eliminar este registro?')) {
        return;
    }

    try {
        const response = await fetch(`/api/${tabla}/eliminar/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Registro eliminado');
            cargarDatosTabla(tabla);
        } else {
            throw new Error('Error al eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar registro');
    }
}

function cerrarModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
}

// ========== FUNCIONES AUXILIARES ==========
function esAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    return usuario && usuario.is_admin === true;
}

function mostrarSeccion(id) {
    document.querySelectorAll('section').forEach(seccion => {
        seccion.style.display = 'none';
    });
    
    const seccion = document.getElementById(id);
    if (seccion) seccion.style.display = 'block';
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== HEADER DINÁMICO ==========
let lastScroll = 0;
const header = document.querySelector('header');

if (header) {
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (Math.abs(currentScroll - lastScroll) < 50) return;
        
        if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
            header.classList.remove('show');
            header.classList.add('hide');
        } else if (currentScroll < lastScroll) {
            header.classList.remove('hide');
            header.classList.add('show');
        }
        
        lastScroll = currentScroll;
    });
}