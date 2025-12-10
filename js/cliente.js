// js/cliente.js
// Lógica del catálogo para cliente: filtros, favoritos y calificaciones

let juegosCliente = [];
let usuarioCliente = null;

document.addEventListener("DOMContentLoaded", async () => {
    // Solo clientes
    usuarioCliente = verificarAcceso("cliente");

    await cargarJuegosCliente();
    configurarEventosCliente();
    renderizarJuegos();
    renderizarFavoritos();
});

async function cargarJuegosCliente() {
    const todos = await apiObtenerJuegos();
    const ocultos = apiObtenerJuegosOcultos();
    // Solo mostramos los que no estén ocultos por el admin
    juegosCliente = todos.filter(j => !ocultos.includes(j.id));
}

function configurarEventosCliente() {
    const btnFiltros = document.getElementById("btnAplicarFiltros");
    btnFiltros.addEventListener("click", () => {
        renderizarJuegos();
    });
}

function obtenerFiltros() {
    return {
        nombre: document.getElementById("filtroNombre").value.trim().toLowerCase(),
        genero: document.getElementById("filtroGenero").value,
        plataforma: document.getElementById("filtroPlataforma").value
    };
}

function filtrarJuegos() {
    const filtros = obtenerFiltros();
    return juegosCliente.filter(j => {
        const coincideNombre = j.nombre.toLowerCase().includes(filtros.nombre);
        const coincideGenero = filtros.genero ? j.genero === filtros.genero : true;
        const coincidePlataforma = filtros.plataforma ? j.plataforma === filtros.plataforma : true;
        return coincideNombre && coincideGenero && coincidePlataforma;
    });
}

function renderizarJuegos() {
    const contenedor = document.getElementById("listaJuegos");
    contenedor.innerHTML = "";

    const filtrados = filtrarJuegos();
    const calificaciones = apiObtenerCalificaciones();
    const favoritosIds = obtenerIdsFavoritos();

    filtrados.forEach(juego => {
        const card = document.createElement("div");
        card.className = "card-juego";
        card.setAttribute("data-buscable", "true");

        // Calificación promedio
        const califsJuego = calificaciones.filter(c => c.idJuego === juego.id);
        let promedio = "Sin calificaciones";
        if (califsJuego.length > 0) {
            const suma = califsJuego.reduce((acc, c) => acc + c.calificacion, 0);
            promedio = (suma / califsJuego.length).toFixed(1);
        }

        const esFavorito = favoritosIds.includes(juego.id);

        card.innerHTML = `
            <h3>${juego.nombre}</h3>
            <p>Género: ${juego.genero}</p>
            <p>Plataforma: ${juego.plataforma}</p>
            <p>Calificación promedio: ${promedio}</p>
            <button class="btn-favorito" data-id="${juego.id}">
                ${esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
            </button>
            <div class="campo-formulario">
                <label>Tu calificación (1 a 5):</label>
                <select class="select-calificacion" data-id="${juego.id}">
                    <option value="">Seleccione</option>
                    <option value="1">1 ⭐</option>
                    <option value="2">2 ⭐</option>
                    <option value="3">3 ⭐</option>
                    <option value="4">4 ⭐</option>
                    <option value="5">5 ⭐</option>
                </select>
                <button class="btn-calificar" data-id="${juego.id}">Guardar calificación</button>
            </div>
        `;

        contenedor.appendChild(card);
    });

    // Eventos para botones dentro de las tarjetas
    contenedor.querySelectorAll(".btn-favorito").forEach(btn => {
        btn.addEventListener("click", () => {
            const idJuego = parseInt(btn.getAttribute("data-id"));
            toggleFavorito(idJuego);
            renderizarJuegos();
            renderizarFavoritos();
        });
    });

    contenedor.querySelectorAll(".btn-calificar").forEach(btn => {
        btn.addEventListener("click", () => {
            const idJuego = parseInt(btn.getAttribute("data-id"));
            const select = contenedor.querySelector(`.select-calificacion[data-id="${idJuego}"]`);
            const valor = parseInt(select.value);
            if (!valor || valor < 1 || valor > 5) {
                alert("Selecciona una calificación entre 1 y 5.");
                return;
            }
            guardarCalificacion(idJuego, valor);
            alert("Calificación guardada.");
            renderizarJuegos();
        });
    });
}

// FAVORITOS (por cliente)
function obtenerIdsFavoritos() {
    const clave = `favoritos_${usuarioCliente.correo}`;
    const data = localStorage.getItem(clave);
    return data ? JSON.parse(data) : [];
}

function guardarIdsFavoritos(ids) {
    const clave = `favoritos_${usuarioCliente.correo}`;
    localStorage.setItem(clave, JSON.stringify(ids));
}

function toggleFavorito(idJuego) {
    let ids = obtenerIdsFavoritos();
    if (ids.includes(idJuego)) {
        ids = ids.filter(id => id !== idJuego);
    } else {
        ids.push(idJuego);
    }
    guardarIdsFavoritos(ids);
}

function renderizarFavoritos() {
    const contenedor = document.getElementById("listaFavoritos");
    contenedor.innerHTML = "";

    const ids = obtenerIdsFavoritos();
    const favoritos = juegosCliente.filter(j => ids.includes(j.id));

    favoritos.forEach(juego => {
        const card = document.createElement("div");
        card.className = "card-juego";
        card.innerHTML = `
            <h3>${juego.nombre}</h3>
            <p>Género: ${juego.genero}</p>
            <p>Plataforma: ${juego.plataforma}</p>
        `;
        contenedor.appendChild(card);
    });
}

// CALIFICACIONES (cliente deja calificación, admin lo verá)
function guardarCalificacion(idJuego, valor) {
    const calificaciones = apiObtenerCalificaciones();
    // Buscamos si este cliente ya calificó este juego
    const existente = calificaciones.find(c => c.idJuego === idJuego && c.correoCliente === usuarioCliente.correo);

    if (existente) {
        existente.calificacion = valor;
    } else {
        calificaciones.push({
            idJuego,
            correoCliente: usuarioCliente.correo,
            calificacion: valor
        });
    }

    apiGuardarCalificaciones(calificaciones);
}
