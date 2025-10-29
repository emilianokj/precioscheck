document.addEventListener('DOMContentLoaded', () => {
    // Obtener el EAN de la URL (ej: ?ean=123456789)
    const urlParams = new URLSearchParams(window.location.search);
    const nombreProducto = urlParams.get('nombre'); 
    
    if (!nombreProducto) {
        return;
    }
    
    const API_URL = `http://localhost:8080/api/comparacion/nombre?nombre=${nombreProducto}`;
    
    fetch(API_URL)
        .then(response => {
            if (response.status === 404) {
                // Manejar producto no encontrado
                return Promise.reject('No se encontraron productos similares para "${nombreProducto}".');
            }
            if (!response.ok) {
                return Promise.reject('Error en la conexión con el servidor.');
            }
            return response.json();
        })
        .then(data => {
            // Llamar a la función principal para pintar los datos
            renderizarComparacion(data);
        })
        .catch(error => {
            // Mostrar error en pantalla
            document.body.innerHTML = `<h1>Error al cargar la comparación:</h1><p>${error}</p>`;
            console.error(error);
        });

});

function renderizarComparacion(data) {
    const contenedorCards = document.getElementById('contenedor-cards-comparacion');

    document.getElementById('nombre-producto-principal').textContent = data.nombreProducto;

    // Limpiar el contenedor antes de inyectar las cards
    contenedorCards.innerHTML = ''; 

    if (data.precios && data.precios.length > 0) {
        
        const preciosSoloValores = data.precios.map(p => p.precio);
        const precioMinimo = Math.min(...preciosSoloValores); 
        
        // Comprobar si hay *diversidad* de precios.
        // Convertimos el array a un Set (que solo guarda valores únicos)
        const preciosUnicos = new Set(preciosSoloValores);
        
        // Si hay solo un valor único, significa que todos los precios son iguales (ej: [4800, 4800])
        const hayOfertaUnica = preciosUnicos.size > 1; // TRUE si hay al menos dos precios diferentes
        
        // Iterar sobre el array de precios y crear una Card por cada uno
        data.precios.forEach(detallePrecio => {
            
            // CREAR EL ELEMENTO <article>
            const card = document.createElement('article');
            card.classList.add('card-producto');
            
            if (detallePrecio.precio === precioMinimo && hayOfertaUnica) {
                card.classList.add('card-producto--oferta-minima'); // Clase para destacar la mejor oferta
            }
            
            // Formatear el precio a moneda local (ARS)
            const precioFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(detallePrecio.precio);

            // INYECTAR EL CONTENIDO HTML DENTRO DE LA CARD
            card.innerHTML = `
                <a class="card-producto__enlace" href="${detallePrecio.urlProductoSupermercado}" target="_blank">
                    <img class="card-producto__imagen" src="${data.urlImagen || './assets/img/default.webp'}" alt="Imagen de ${data.nombreProducto}">
                </a>
                <h2 class="card-producto__nombre">${data.nombreProducto}</h2>
                <p class="card-producto__supermercado">${detallePrecio.nombreSupermercado}</p>
                <p class="card-producto__precio">${precioFormateado}</p>
            `;

            // AÑADIR LA CARD AL CONTENEDOR PRINCIPAL
            contenedorCards.appendChild(card);
        });
        
    } else {
        // Manejar el caso de que no haya precios
        contenedorCards.innerHTML = '<p>No hay precios disponibles para este producto en este momento.</p>';
    }
}