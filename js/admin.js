// js/admin.js
// Lógica del panel de administrador

let juegosAdmin = [];
let usuarioAdmin = null;

document.addEventListener("DOMContentLoaded", async () => {
    // Solo admin
    usuarioAdmin = verificarAcceso("admin");

    await cargarJuegosAdmin();
    renderizarJuegosAdmin();
    renderizarClientes();
    renderizarCalificaciones();
});

async function cargarJuegosAdmin() {
    juegosAdmin = await apiObtenerJuegos();
}

function renderizarJuegosAdmin() {
    const contenedor = document.getElementById("listaJuegosAdmin");
    contenedor.innerHTML = "";

    const ocultos = apiObtenerJuegosOcultos();

    juegosAdmin.forEach(juego => {
        const card = document.createElement("div");
        card.className = "card-juego";

        const estaOculto = ocultos.includes(juego.id);

        card.innerHTML = `
            <h3>${juego.nombre}</h3>
            <p>Género: ${juego.genero}</p>
            <p>Plataforma: ${juego.plataforma}</p>
            <p>Estado: ${estaOculto ? "Oculto" : "Visible"}</p>
            <button class="btn-ocultar" data-id="${juego.id}">
                ${estaOculto ? "Mostrar en la búsqueda" : "Ocultar de la búsqueda"}
            </button>
        `;

        contenedor.appendChild(card);
    });

    contenedor.querySelectorAll(".btn-ocultar").forEach(btn => {
        btn.addEventListener("click", () => {
            const idJuego = parseInt(btn.getAttribute("data-id"));
            toggleOcultarJuego(idJuego);
            renderizarJuegosAdmin();
        });
    });
}

function toggleOcultarJuego(idJuego) {
    let ocultos = apiObtenerJuegosOcultos();
    if (ocultos.includes(idJuego)) {
        ocultos = ocultos.filter(id => id !== idJuego);
    } else {
        ocultos.push(idJuego);
    }
    apiGuardarJuegosOcultos(ocultos);
}

// LISTA DE CLIENTES
function renderizarClientes() {
    const tbody = document.getElementById("tablaClientes");
    tbody.innerHTML = "";

    const usuarios = apiObtenerUsuarios();
    const clientes = usuarios.filter(u => u.rol === "cliente");

    clientes.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.nombre}</td>
            <td>${c.correo}</td>
        `;
        tbody.appendChild(tr);
    });
}

// CALIFICACIONES (dejadas por clientes, admin las puede ver)
function renderizarCalificaciones() {
    const tbody = document.getElementById("tablaCalificaciones");
    tbody.innerHTML = "";

    const calificaciones = apiObtenerCalificaciones();
    const usuarios = apiObtenerUsuarios();

    calificaciones.forEach(c => {
        const juego = juegosAdmin.find(j => j.id === c.idJuego);
        const cliente = usuarios.find(u => u.correo === c.correoCliente);

        const nombreJuego = juego ? juego.nombre : `ID ${c.idJuego}`;
        const nombreCliente = cliente ? cliente.nombre : c.correoCliente;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${nombreJuego}</td>
            <td>${nombreCliente}</td>
            <td>${c.calificacion}</td>
        `;
        tbody.appendChild(tr);
    });
}
