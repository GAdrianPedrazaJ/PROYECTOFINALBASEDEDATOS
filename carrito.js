// carrito.js - Sistema completo de gestión del carrito
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let carrito = [];
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const btnProcederPago = document.getElementById('proceder-pago');
    const formularioPedido = document.getElementById('formulario-pedido');
    const listaProductosSection = document.querySelector('.lista-productos');
    const volverCarritoBtn = document.getElementById('volver-carrito');
    const cantidadInput = document.getElementById('cantidad');
    
    // Cargar carrito desde localStorage al iniciar
    cargarCarrito();
    
    // Función para agregar productos al carrito
    window.agregarAlCarrito = function(producto) {
        const existe = carrito.some(item => item.nombre === producto.nombre);
        
        if (existe) {
            carrito = carrito.map(item => {
                if (item.nombre === producto.nombre) {
                    item.cantidad++;
                }
                return item;
            });
        } else {
            carrito.push({
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1,
                tipo: producto.tipo || 'personal'
            });
        }
        
        actualizarCarrito();
        guardarCarrito();
        mostrarSeccion('carrito');
    };
    
    // Actualizar visualización del carrito
    function actualizarCarrito() {
        listaCarrito.innerHTML = '';
        let total = 0;
        let cantidadTotal = 0;
        
        carrito.forEach(producto => {
            const productoHTML = `
                <div class="item-carrito">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <div class="info-item">
                        <h3>${producto.nombre}</h3>
                        <p>Precio: ${producto.precio}</p>
                        <p>Tipo: ${producto.tipo}</p>
                        <div class="cantidad-item">
                            <button class="btn-cantidad restar" data-nombre="${producto.nombre}">-</button>
                            <span>${producto.cantidad}</span>
                            <button class="btn-cantidad sumar" data-nombre="${producto.nombre}">+</button>
                            <button class="btn-eliminar" data-nombre="${producto.nombre}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            listaCarrito.innerHTML += productoHTML;
            
            const precioNumerico = parseFloat(producto.precio.replace('$', '').replace(',', ''));
            total += precioNumerico * producto.cantidad;
            cantidadTotal += producto.cantidad;
        });
        
        totalCarrito.textContent = `$${total.toFixed(2)}`;
        cantidadInput.value = cantidadTotal; // Actualizar campo cantidad del formulario
        btnProcederPago.style.display = carrito.length > 0 ? 'block' : 'none';
    }
    
    // Eventos para modificar cantidades
    listaCarrito.addEventListener('click', function(e) {
        const nombre = e.target.getAttribute('data-nombre');
        
        if (e.target.classList.contains('restar')) {
            carrito = carrito.map(item => {
                if (item.nombre === nombre && item.cantidad > 1) {
                    item.cantidad--;
                }
                return item;
            });
        }
        
        if (e.target.classList.contains('sumar')) {
            carrito = carrito.map(item => {
                if (item.nombre === nombre) {
                    item.cantidad++;
                }
                return item;
            });
        }
        
        if (e.target.classList.contains('btn-eliminar')) {
            carrito = carrito.filter(item => item.nombre !== nombre);
        }
        
        actualizarCarrito();
        guardarCarrito();
    });
    
    // Proceder al pago
    btnProcederPago.addEventListener('click', function() {
        listaProductosSection.style.display = 'none';
        formularioPedido.style.display = 'block';
        // Actualizar cantidad automáticamente
        document.getElementById('cantidad').value = carrito.reduce((total, item) => total + item.cantidad, 0);
    });
    
    // Volver al carrito
    volverCarritoBtn.addEventListener('click', function() {
        listaProductosSection.style.display = 'block';
        formularioPedido.style.display = 'none';
    });
    
    // Guardar en localStorage
    function guardarCarrito() {
        localStorage.setItem('carritoManillania', JSON.stringify(carrito));
    }
    
    // Cargar desde localStorage
    function cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carritoManillania');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            actualizarCarrito();
        }
    }
    
    // Limpiar carrito después de compra
    document.getElementById('form-pedido').addEventListener('submit', function(e) {
        // Guardar datos del formulario
        const datosFormulario = {
            cantidad: document.getElementById('cantidad').value,
            // otros campos del formulario...
        };
        localStorage.setItem('ultimoPedido', JSON.stringify(datosFormulario));
        
        // Limpiar carrito
        localStorage.removeItem('carritoManillania');
        carrito = [];
        actualizarCarrito();
    });
    
    // Función para mostrar secciones
    window.mostrarSeccion = function(id) {
        document.querySelectorAll('section').forEach(seccion => {
            seccion.style.display = 'none';
        });
        document.getElementById(id).style.display = 'block';
        
        if (id === 'carrito') {
            listaProductosSection.style.display = 'block';
            formularioPedido.style.display = 'none';
        }
    };
});