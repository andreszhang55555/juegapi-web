document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const searchInfo = document.getElementById("searchInfo");

  if (!searchForm || !searchInput) return; // Si esta página no tiene buscador, no hacemos nada

  // Buscar mientras escribe
  searchInput.addEventListener("input", () => {
    filtrar(searchInput.value);
  });

  // Y también al enviar el formulario (por si presiona Enter o el botón)
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault(); // No recargar ni ir a Google
    filtrar(searchInput.value);
  });

  function filtrar(termino) {
    const texto = termino.trim().toLowerCase();
    const items = document.querySelectorAll('[data-buscable="true"]');
    let encontrados = 0;

    items.forEach((item) => {
      const contenido = item.textContent.toLowerCase();

      if (!texto) {
        // Si el buscador está vacío, mostramos todo
        item.style.display = "";
        encontrados++;
      } else if (contenido.includes(texto)) {
        item.style.display = "";
        encontrados++;
      } else {
        item.style.display = "none";
      }
    });

    if (searchInfo) {
      if (!texto) {
        searchInfo.textContent = "";
      } else if (encontrados === 0) {
        searchInfo.textContent = `No se encontraron resultados para "${termino}".`;
      } else {
        searchInfo.textContent = `Resultados encontrados: ${encontrados}`;
      }
    }
  }
});
