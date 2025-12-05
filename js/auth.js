// js/auth.js
// Manejo de usuarios, login, registro y sesión usando localStorage

document.addEventListener("DOMContentLoaded", () => {
    inicializarAdminPorDefecto();
    manejarFormulariosAuth();
    configurarBotonLogout();
});

// Crea un admin por defecto si no existe
function inicializarAdminPorDefecto() {
    let usuarios = apiObtenerUsuarios();
    const existeAdmin = usuarios.some(u => u.rol === "admin");

    if (!existeAdmin) {
        usuarios.push({
            nombre: "Administrador",
            correo: "admin@juegapi.com",
            password: "admin123",
            rol: "admin"
        });
        apiGuardarUsuarios(usuarios);
    }
}

// Detecta si hay formularios de login / registro en la página
function manejarFormulariosAuth() {
    const loginForm = document.getElementById("loginForm");
    const registroForm = document.getElementById("registroForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            procesarLogin();
        });
    }

    if (registroForm) {
        registroForm.addEventListener("submit", (e) => {
            e.preventDefault();
            procesarRegistro();
        });
    }
}

// Procesar login
function procesarLogin() {
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();
    const rol = document.getElementById("rol").value;
    const mensaje = document.getElementById("loginMensaje");

    const usuarios = apiObtenerUsuarios();
    const encontrado = usuarios.find(u => u.correo === correo && u.password === password && u.rol === rol);

    if (!encontrado) {
        mensaje.textContent = "Credenciales incorrectas o rol no coincide.";
        mensaje.style.color = "red";
        return;
    }

    // Guardamos la sesión actual
    localStorage.setItem("usuarioActual", JSON.stringify({
        nombre: encontrado.nombre,
        correo: encontrado.correo,
        rol: encontrado.rol
    }));

    mensaje.textContent = "Inicio de sesión exitoso.";
    mensaje.style.color = "green";

    if (rol === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "cliente.html";
    }
}

// Procesar registro (crea usuarios cliente)
function procesarRegistro() {
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmar = document.getElementById("confirmar").value.trim();
    const mensaje = document.getElementById("registroMensaje");

    if (password !== confirmar) {
        mensaje.textContent = "Las contraseñas no coinciden.";
        mensaje.style.color = "red";
        return;
    }

    let usuarios = apiObtenerUsuarios();
    const existe = usuarios.some(u => u.correo === correo);

    if (existe) {
        mensaje.textContent = "Ya existe un usuario con ese correo.";
        mensaje.style.color = "red";
        return;
    }

    usuarios.push({
        nombre,
        correo,
        password,
        rol: "cliente"
    });

    apiGuardarUsuarios(usuarios);

    mensaje.textContent = "Registro exitoso. Ahora puedes iniciar sesión.";
    mensaje.style.color = "green";
}

// Configurar botón de logout (si existe)
function configurarBotonLogout() {
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("usuarioActual");
            window.location.href = "index.html";
        });
    }
}

// Verificar rol para páginas protegidas
function verificarAcceso(rolRequerido) {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || "null");
    if (!usuarioActual || usuarioActual.rol !== rolRequerido) {
        alert("No tienes permiso para acceder a esta página.");
        window.location.href = "index.html";
    }
    return usuarioActual;
}
