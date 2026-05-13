const USUARIOS_API = 'http://localhost:8080/api/usuarios';
const cards = document.querySelectorAll('.card');
const searchInput = document.querySelector('.filters input');
const roleSelect = document.querySelector('.filters select');
const addButton = document.querySelector('.add');
const cuerpoTabla = document.querySelector('tbody');

let usuarios = [];

function obtenerId(usuario) {
    return usuario.id || usuario._id || '';
}

function asignarDepartamento(edad) {
    if (edad < 25) return 'Ventas';
    if (edad < 35) return 'Inventario';
    return 'Administración';
}

function asignarRol(edad) {
    if (edad < 25) return 'Empleado';
    if (edad < 35) return 'Gerente';
    return 'Administrador';
}

function renderizarUsuarios(lista) {
    if (!lista.length) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:#ddd;">No se encontraron usuarios.</td>
            </tr>
        `;
        return;
    }

    cuerpoTabla.innerHTML = lista.map(usuario => {
        const id = obtenerId(usuario);
        const nombre = usuario.nombre || '';
        const correo = usuario.correo || '';
        const edad = usuario.edad ?? '-';
        const departamento = asignarDepartamento(Number(edad));
        const rol = asignarRol(Number(edad));
        const estado = 'Activo';
        return `
            <tr>
                <td>${nombre}</td>
                <td>${correo}</td>
                <td>${departamento}</td>
                <td>+57 3000000000</td>
                <td>${estado}</td>
                <td><span class="tag ${rol.toLowerCase()}">${rol}</span></td>
                <td>
                    <button type="button" data-action="editar" data-id="${id}">Editar</button>
                    <button type="button" class="delete" data-action="eliminar" data-id="${id}">Borrar</button>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarTarjetas() {
    const total = usuarios.length;
    const activos = usuarios.length;
    const adminCount = usuarios.filter(usuario => asignarRol(usuario.edad) === 'Administrador').length;

    if (cards[0]) cards[0].innerHTML = `Usuarios<br><b>${total}</b>`;
    if (cards[1]) cards[1].innerHTML = `Usuarios activos<br><b>${activos}</b>`;
    if (cards[2]) cards[2].innerHTML = `Usuarios Inactivos<br><b>0</b>`;
    if (cards[3]) cards[3].innerHTML = `Administrador<br><b>${adminCount}</b>`;
}

function filtrarUsuarios() {
    const termino = searchInput.value.trim().toLowerCase();
    const rolSeleccionado = roleSelect.value;

    const filtrados = usuarios.filter(usuario => {
        const nombre = (usuario.nombre || '').toLowerCase();
        const correo = (usuario.correo || '').toLowerCase();
        const esMatchTexto = !termino || nombre.includes(termino) || correo.includes(termino);
        const rol = asignarRol(usuario.edad);
        const esMatchRol = rolSeleccionado === 'Todos los Roles' || rol === rolSeleccionado;
        return esMatchTexto && esMatchRol;
    });

    renderizarUsuarios(filtrados);
}

async function cargarUsuarios() {
    try {
        const respuesta = await fetch(USUARIOS_API);
        if (!respuesta.ok) {
            throw new Error(`Error cargando usuarios (${respuesta.status})`);
        }

        usuarios = await respuesta.json();
        actualizarTarjetas();
        renderizarUsuarios(usuarios);
    } catch (error) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:#f88;">No se pudieron cargar los usuarios.</td>
            </tr>
        `;
        console.error(error);
    }
}

async function crearUsuario(usuario) {
    try {
        const respuesta = await fetch(USUARIOS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        if (!respuesta.ok) {
            throw new Error(`Error al crear usuario (${respuesta.status})`);
        }

        await cargarUsuarios();
    } catch (error) {
        alert('No se pudo crear el usuario.');
        console.error(error);
    }
}

async function eliminarUsuario(id) {
    try {
        const url = `${USUARIOS_API}/${id}`;
        const respuesta = await fetch(url, { method: 'DELETE' });
        if (!respuesta.ok) {
            throw new Error(`Error al eliminar usuario (${respuesta.status})`);
        }
        await cargarUsuarios();
    } catch (error) {
        alert('No se pudo eliminar el usuario.');
        console.error(error);
    }
}

addButton.addEventListener('click', () => {
    const nombre = prompt('Nombre del usuario:');
    if (!nombre) return;

    const correo = prompt('Correo electrónico:');
    if (!correo) return;

    const edadTexto = prompt('Edad:');
    const edad = Number(edadTexto);
    if (!edadTexto || Number.isNaN(edad)) {
        alert('Edad inválida.');
        return;
    }

    crearUsuario({ nombre, correo, edad });
});

cuerpoTabla.addEventListener('click', event => {
    const boton = event.target.closest('button');
    if (!boton) return;

    const accion = boton.dataset.action;
    const id = boton.dataset.id;
    if (!accion || !id) return;

    if (accion === 'eliminar') {
        const confirmar = confirm('¿Deseas eliminar este usuario?');
        if (confirmar) {
            eliminarUsuario(id);
        }
    }

    if (accion === 'editar') {
        alert('Edición de usuario no disponible en esta versión.');
    }
});

searchInput.addEventListener('input', filtrarUsuarios);
roleSelect.addEventListener('change', filtrarUsuarios);
window.addEventListener('DOMContentLoaded', cargarUsuarios);