// cerrar-sesion.js - Lógica independiente para el botón de cerrar sesión

document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar el botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    
    // Verificar si el botón existe en la página actual
    if (btnCerrarSesion) {
        // Añadir event listener para el click
        btnCerrarSesion.addEventListener('click', function() {
            // Eliminar los datos de usuario y carrito del localStorage
            localStorage.removeItem('usuario');
            localStorage.removeItem('carrito');
            
            // Redirigir a la página principal
            window.location.href = 'index.html';
        });
        
        // Verificar estado de autenticación al cargar la página
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const usuarioNombre = document.getElementById('nombre-usuario');
        const btnIniciarSesion = document.getElementById('btn-iniciar-sesion');
        const btnRegistrarse = document.getElementById('btn-registrarse');
        
        // Mostrar/ocultar elementos según el estado de autenticación
        if (usuario && usuario.nombre_completo) {
            if (usuarioNombre) {
                usuarioNombre.textContent = `Bienvenido, ${usuario.nombre_completo}`;
                usuarioNombre.style.display = 'inline';
            }
            if (btnIniciarSesion) btnIniciarSesion.style.display = 'none';
            if (btnRegistrarse) btnRegistrarse.style.display = 'none';
            btnCerrarSesion.style.display = 'inline';
        } else {
            if (usuarioNombre) usuarioNombre.style.display = 'none';
            if (btnIniciarSesion) btnIniciarSesion.style.display = 'inline';
            if (btnRegistrarse) btnRegistrarse.style.display = 'inline';
            btnCerrarSesion.style.display = 'none';
        }
    }
});