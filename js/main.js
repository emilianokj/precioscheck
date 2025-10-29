document.addEventListener('DOMContentLoaded', () => {
    const inputBusqueda = document.getElementById('input-busqueda');
    const botonBusqueda = document.getElementById('boton-busqueda');
    const contenedorSugerencias = document.getElementById('contenedor-sugerencias');
    const formBusqueda = document.getElementById('formulario-busqueda');

    let nombreSeleccionado = null
    
    // BÚSQUEDA Y SUGERENCIAS (KEYUP) se activa cada vez que el usuario deja de presionar una tecla
    inputBusqueda.addEventListener('keyup', () => {
        const consulta = inputBusqueda.value.trim();
        
        // Limpiamos sugerencias viejas al escribir algo nuevo
        contenedorSugerencias.innerHTML = ''; 
        nombreSeleccionado = null;
        botonBusqueda.disabled = true;

        if (consulta.length < 3) {
            return;
        }

        // Llamada al endpoint de sugerencias
        const SUGERENCIAS_API_URL = `http://localhost:8080/api/producto/autocompletar?q=${consulta}`;
        
        fetch(SUGERENCIAS_API_URL)
            .then(response => response.json())
            .then(sugerencias => {
                if (sugerencias.length > 0) {
                    renderizarSugerencias(sugerencias);
                }
            })
            .catch(error => console.error('Error al obtener sugerencias:', error));
    });
    
    // --- RENDERIZADO Y SELECCIÓN --- 
    function renderizarSugerencias(sugerencias) {
        let ul = document.createElement('ul');
        ul.classList.add('sugerencias-lista');

        sugerencias.forEach(sugerencia => {
            const li = document.createElement('li');
            li.textContent = sugerencia.nombreCompleto;
            li.dataset.ean = sugerencia.codigoBarra;
            li.dataset.nombre = sugerencia.nombreCompleto;
            li.classList.add('sugerencia-item');

            // Manejador de clic: Cuando el usuario selecciona una sugerencia
            li.addEventListener('click', function() {
                // Rellenar el input
                inputBusqueda.value = this.textContent;
                
                // Guardar el nombre seleccionado
                nombreSeleccionado = this.dataset.nombre
                
                // Limpiar y activar el botón de búsqueda
                contenedorSugerencias.innerHTML = '';
                botonBusqueda.disabled = false;
            });
            ul.appendChild(li);
        });

        contenedorSugerencias.appendChild(ul);
    }
    
    formBusqueda.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        if (nombreSeleccionado) {
            // Redirigir a la página de comparación con el EAN guardado
            const nombreEncoded = encodeURIComponent(nombreSeleccionado);
            window.location.href = `comparacion-productos.html?nombre=${nombreEncoded}`;
        } else {
             // Si apretan buscar sin seleccionar nada, hacemos una última verificación
            alert('Por favor, selecciona un producto de las sugerencias para comparar.');
        }
    });
});
