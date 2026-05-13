const HEALTH_URL = 'http://localhost:8080/api/health';
const loginForm = document.querySelector('form');
const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('input[type="password"]');

function mostrarAlerta(mensaje) {
    window.alert(mensaje);
}

async function verificarBackend() {
    try {
        const respuesta = await fetch(HEALTH_URL);
        if (!respuesta.ok) {
            throw new Error(`Backend no disponible (${respuesta.status})`);
        }
        return true;
    } catch (error) {
        mostrarAlerta('No se pudo conectar con el backend en localhost:8080. Por favor verifica que esté corriendo.');
        return false;
    }
}

loginForm.addEventListener('submit', async event => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        mostrarAlerta('Ingresa correo y contraseña.');
        return;
    }

    const backendOK = await verificarBackend();
    if (backendOK) {
        window.location.href = 'dashboard.html';
    }
});