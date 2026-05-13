const API_BASE = 'http://localhost:8080/api/productos';

const productoForm = document.getElementById('producto-form');
const nombreInput = document.getElementById('nombre');
const categoriaInput = document.getElementById('categoria');
const stockInput = document.getElementById('stock');
const precioInput = document.getElementById('precio');
const productoIdInput = document.getElementById('producto-id');
const guardarBtn = document.getElementById('guardar-btn');
const cancelarBtn = document.getElementById('cancelar-btn');
const productosBody = document.getElementById('productos-body');
const statusBox = document.getElementById('status');
const busquedaInput = document.getElementById('busqueda-input');
const categoriaSelect = document.getElementById('categoria-select');
const formTitle = document.getElementById('form-title');
 
let productos = [];

function mostrarEstado(mensaje, tipo = 'success') {
    statusBox.textContent = mensaje;
    statusBox.className = `status ${tipo}`;
    statusBox.style.display = 'block';
    setTimeout(() => {
        statusBox.style.display = 'none';
    }, 4000);
}

function limpiarFormulario() {
    productoForm.reset();
    productoIdInput.value = '';
    formTitle.textContent = 'Registrar producto';
    guardarBtn.textContent = 'Guardar producto';
}

function obtenerId(producto) {
    return producto.id || producto._id || producto.sku || '';
}

function renderizarProductos(lista) {
    productosBody.innerHTML = '';

    if (!lista.length) {
        productosBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:#ddd;">No hay productos disponibles.</td>
            </tr>
        `;
        return;
    }

    lista.forEach(producto => {
        const id = obtenerId(producto);
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${id || 'N/A'}</td>
            <td>${producto.nombre || ''}</td>
            <td>${producto.categoria || ''}</td>
            <td>${producto.stock ?? ''}</td>
            <td>${producto.precio ?? ''}</td>
            <td>
                <button type="button" class="btn" data-action="editar" data-id="${id}">Editar</button>
                <button type="button" class="btn secondary" data-action="eliminar" data-id="${id}">Eliminar</button>
            </td>
        `;

        productosBody.appendChild(fila);
    });
}

function filtrarProductos() {
    const busqueda = busquedaInput.value.trim().toLowerCase();
    const categoria = categoriaSelect.value;

    const filtrados = productos.filter(producto => {
        const nombre = (producto.nombre || '').toLowerCase();
        const categoriaProducto = (producto.categoria || '').toLowerCase();
        const coincideBusqueda = !busqueda || nombre.includes(busqueda) || categoriaProducto.includes(busqueda);
        const coincideCategoria = !categoria || categoriaProducto === categoria.toLowerCase();
        return coincideBusqueda && coincideCategoria;
    });

    renderizarProductos(filtrados);
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(API_BASE);
        if (!respuesta.ok) {
            throw new Error(`Error al cargar productos: ${respuesta.status} ${respuesta.statusText}`);
        }
        productos = await respuesta.json();
        filtrarProductos();
    } catch (error) {
        productosBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:#f88;">No se pudo cargar el inventario.</td>
            </tr>
        `;
        mostrarEstado(error.message, 'error');
    }
}

async function crearProducto(datos) {
    try {
        const respuesta = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            const detalle = await respuesta.text();
            throw new Error(`No se pudo crear el producto: ${respuesta.status} ${detalle}`);
        }

        mostrarEstado('Producto creado correctamente', 'success');
        limpiarFormulario();
        await cargarProductos();
    } catch (error) {
        mostrarEstado(error.message, 'error');
    }
}

async function actualizarProducto(id, datos) {
    try {
        const url = `${API_BASE}/${id}`;
        const respuesta = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            const detalle = await respuesta.text();
            throw new Error(`No se pudo actualizar el producto: ${respuesta.status} ${detalle}`);
        }

        mostrarEstado('Producto actualizado correctamente', 'success');
        limpiarFormulario();
        await cargarProductos();
    } catch (error) {
        mostrarEstado(error.message, 'error');
    }
}

async function eliminarProducto(id) {
    try {
        const url = `${API_BASE}/${id}`;
        const respuesta = await fetch(url, {
            method: 'DELETE'
        });

        if (!respuesta.ok) {
            const detalle = await respuesta.text();
            throw new Error(`No se pudo eliminar el producto: ${respuesta.status} ${detalle}`);
        }

        mostrarEstado('Producto eliminado correctamente', 'success');
        await cargarProductos();
    } catch (error) {
        mostrarEstado(error.message, 'error');
    }
}

function editarProducto(producto) {
    nombreInput.value = producto.nombre || '';
    categoriaInput.value = producto.categoria || '';
    stockInput.value = producto.stock ?? '';
    precioInput.value = producto.precio ?? '';
    productoIdInput.value = obtenerId(producto);
    formTitle.textContent = 'Editar producto';
    guardarBtn.textContent = 'Actualizar producto';
}

function obtenerProductoPorId(id) {
    return productos.find(producto => obtenerId(producto).toString() === id.toString());
}

productoForm.addEventListener('submit', event => {
    event.preventDefault();

    const datos = {
        nombre: nombreInput.value.trim(),
        categoria: categoriaInput.value.trim(),
        stock: Number(stockInput.value),
        precio: Number(precioInput.value)
    };

    const id = productoIdInput.value;

    if (!datos.nombre || datos.stock < 0 || datos.precio < 0) {
        mostrarEstado('Por favor complete los datos correctos del producto.', 'error');
        return;
    }

    if (id) {
        actualizarProducto(id, datos);
    } else {
        crearProducto(datos);
    }
});

cancelarBtn.addEventListener('click', () => {
    limpiarFormulario();
});

productosBody.addEventListener('click', event => {
    const boton = event.target.closest('button');
    if (!boton) return;

    const accion = boton.dataset.action;
    const id = boton.dataset.id;
    if (!accion || !id) return;

    if (accion === 'editar') {
        const producto = obtenerProductoPorId(id);
        if (producto) {
            editarProducto(producto);
        }
    }

    if (accion === 'eliminar') {
        const confirmar = confirm('¿Deseas eliminar este producto?');
        if (confirmar) {
            eliminarProducto(id);
        }
    }
});

busquedaInput.addEventListener('input', filtrarProductos);
categoriaSelect.addEventListener('change', filtrarProductos);

window.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});