// js/api.js
// Comentario: Aquí simulamos la API. Puedes reemplazar estas funciones por llamadas fetch() reales.

// Datos de ejemplo de juegos
const MOCK_JUEGOS = [
    { id: 1, nombre: "Elden Ring", genero: "RPG", plataforma: "PC" },
    { id: 2, nombre: "God of War", genero: "Acción", plataforma: "PlayStation" },
    { id: 3, nombre: "Halo Infinite", genero: "Acción", plataforma: "Xbox" },
    { id: 4, nombre: "Zelda: Breath of the Wild", genero: "Aventura", plataforma: "Nintendo" },
    { id: 5, nombre: "Civilization VI", genero: "Estrategia", plataforma: "PC" }
];

// Obtener juegos (simulación de API)
async function apiObtenerJuegos() {
    // Ejemplo de cómo se vería con una API real:
    // const resp = await fetch("https://tu-api.com/juegos");
    // const data = await resp.json();
    // return data;

    // Por ahora devolvemos los datos simulados:
    return MOCK_JUEGOS;
}

// Guardar y obtener calificaciones desde localStorage
function apiObtenerCalificaciones() {
    const data = localStorage.getItem("calificaciones");
    return data ? JSON.parse(data) : [];
}

function apiGuardarCalificaciones(calificaciones) {
    localStorage.setItem("calificaciones", JSON.stringify(calificaciones));
}

// Guardar y obtener juegos ocultos (para admin)
function apiObtenerJuegosOcultos() {
    const data = localStorage.getItem("juegosOcultos");
    return data ? JSON.parse(data) : [];
}

function apiGuardarJuegosOcultos(ids) {
    localStorage.setItem("juegosOcultos", JSON.stringify(ids));
}

// Guardar y obtener usuarios
function apiObtenerUsuarios() {
    const data = localStorage.getItem("usuarios");
    return data ? JSON.parse(data) : [];
}

function apiGuardarUsuarios(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}
