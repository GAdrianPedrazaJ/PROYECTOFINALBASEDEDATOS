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