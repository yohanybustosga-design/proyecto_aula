const PRODUCTOS_API = 'http://localhost:8080/api/productos';

const cards = document.querySelectorAll('.dashboard-card');
const dashboardTable = document.querySelector('.dashboard-table');

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(valor);
} 

function renderizarLowStock(productos) {
    const contenido = ['<h3>Productos con stock bajo</h3>'];

    if (!productos.length) {
        contenido.push('<div class="dashboard-row"><span>No hay productos con stock bajo.</span></div>');
    } else {
        productos.forEach(producto => {
            const nombre = producto.nombre || 'Producto';
            const precio = producto.precio ?? 0;
            const stock = producto.stock ?? 0;
            contenido.push(`
                <div class="dashboard-row">
                    <span>${nombre}</span>
                    <span>Precio ${precio} | Stock ${stock}</span>
                </div>
            `);
        });
    }

    dashboardTable.innerHTML = contenido.join('');
}

function actualizarTarjetas(productos) {
    const totalProductos = productos.length;
    const totalValor = productos.reduce((suma, producto) => {
        const precio = Number(producto.precio) || 0;
        const stock = Number(producto.stock) || 0;
        return suma + precio * stock;
    }, 0);
    const bajoStock = productos.filter(producto => Number(producto.stock) <= 5).length;

    if (cards[0]) cards[0].querySelector('h3').textContent = totalProductos;
    if (cards[1]) cards[1].querySelector('h3').textContent = formatearMoneda(totalValor);
    if (cards[2]) cards[2].querySelector('h3').textContent = bajoStock;
}

async function cargarDashboard() {
    try {
        const respuesta = await fetch(PRODUCTOS_API);
        if (!respuesta.ok) {
            throw new Error(`Error al cargar productos (${respuesta.status})`);
        }

        const productos = await respuesta.json();
        actualizarTarjetas(productos);
        renderizarLowStock(productos.filter(producto => Number(producto.stock) <= 5));
    } catch (error) {
        dashboardTable.innerHTML = `
            <h3>Productos con stock bajo</h3>
            <div class="dashboard-row">
                <span style="color:#f88;">No se pudo cargar la información.</span>
            </div>
        `;
        console.error(error);
    }
}

window.addEventListener('DOMContentLoaded', cargarDashboard);