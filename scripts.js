// scripts.js

let rawData = [];
let selectedFuncion = new Set();
let selectedTematica = new Set();
let selectedUnidad = new Set();
let selectedRow = null;

// Referencia al panel derecho (donde mostramos el detalle)
const detailPanel = document.getElementById('detail-panel');
const linksContainer = document.getElementById('detail-links');
const desc = document.getElementById('detail-description');

// Carga data.json
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    rawData = data;
    inicializarFiltros(data);
    renderTabla(); // Render inicial sin filtros
  })
  .catch(err => console.error('Error cargando data.json:', err));

// Extrae valores únicos de Función, Temática, Unidad (UCE) y crea tags
function inicializarFiltros(data) {
  const funcionSet = new Set();
  const tematicaSet = new Set();
  const unidadSet = new Set();

  data.forEach(item => {
    if (item.Función) funcionSet.add(item.Función);
    if (item.Temática) tematicaSet.add(item.Temática);
    if (item.UCE) unidadSet.add(item.UCE); // en la interfaz lo llamamos “Unidad”
  });

  crearTags('funcion-tags', Array.from(funcionSet).sort(), selectedFuncion);
  crearTags('tematica-tags', Array.from(tematicaSet).sort(), selectedTematica);
  crearTags('unidad-tags', Array.from(unidadSet).sort(), selectedUnidad);
}

// Crea tags en contenedor; al hacer clic se togglean en "selected"
function crearTags(containerId, valores, selectedSet) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Limpia
  valores.forEach(valor => {
    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.textContent = valor;
    // Evento para togglear selección
    tag.addEventListener('click', () => {
      if (selectedSet.has(valor)) {
        selectedSet.delete(valor);
        tag.classList.remove('selected');
      } else {
        selectedSet.add(valor);
        tag.classList.add('selected');
      }
      renderTabla();
    });
    container.appendChild(tag);
  });
}

// Renderiza la tabla central con los “Nombre” (distintos) que pasen los filtros
function renderTabla() {
  const tbody = document.getElementById('results-table').querySelector('tbody');
  tbody.innerHTML = '';

  // Aplica filtros
  const filasFiltradas = rawData.filter(item => {
    // Filtro por Función
    if (selectedFuncion.size > 0 && !selectedFuncion.has(item.Función)) {
      return false;
    }
    // Filtro por Temática
    if (selectedTematica.size > 0 && !selectedTematica.has(item.Temática)) {
      return false;
    }
    // Filtro por Unidad (UCE)
    if (selectedUnidad.size > 0 && !selectedUnidad.has(item.UCE)) {
      return false;
    }
    return true;
  });

  // Queremos agrupar por "Nombre"
  //   mapaPorNombre[nombre] = {
  //     nombre: string,
  //     resumen: string,
  //     enlaces: [ { medio, vinculo }, ... ]
  //   }
  const mapaPorNombre = new Map();

  filasFiltradas.forEach(item => {
    const nombre = item.Nombre || 'Sin nombre';
    if (!mapaPorNombre.has(nombre)) {
      mapaPorNombre.set(nombre, {
        nombre,
        resumen: item.Resumen || '',
        enlaces: []
      });
    }
    const obj = mapaPorNombre.get(nombre);

    const medio = item.Medio || 'Otro';
    const vinculo = item['Vínculo'] || '';

    // Evitar duplicados exactos
    const yaExiste = obj.enlaces.some(e => e.medio === medio && e.vinculo === vinculo);
    if (!yaExiste) {
      obj.enlaces.push({ medio, vinculo });
    }
  });

  // Render de cada "Nombre" único
  Array.from(mapaPorNombre.values()).forEach(obj => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${obj.nombre}</td>`;

    // Al hacer clic en la fila, marcamos la fila como seleccionada
    tr.addEventListener('click', (event) => {
      // Evitar que se cierre el panel al hacer clic en la fila
      event.stopPropagation();

      // Si había otra fila seleccionada, le quitamos la clase
      if (selectedRow) {
        selectedRow.classList.remove('selected');
      }
      // Guardamos la nueva fila como "seleccionada"
      selectedRow = tr;
      tr.classList.add('selected');

      // Mostramos el detalle en el panel derecho
      mostrarDetalle(obj);
    });
      tbody.appendChild(tr);
  });
}

// Muestra el detalle (Resumen + múltiples links) en el panel derecho
function mostrarDetalle(obj) {
  // Limpiar contenedor de links
  linksContainer.innerHTML = '';

  // Agregar un botón/enlace por cada { medio, vinculo }
  obj.enlaces.forEach(({ medio, vinculo }) => {
    if (vinculo) {
      const linkEl = document.createElement('a');
      linkEl.href = vinculo;
      linkEl.target = '_blank';
      linkEl.textContent = medio; // Texto del botón = "Medio"
      linksContainer.appendChild(linkEl);
    }
  });

  // Mostrar resumen
  desc.textContent = obj.resumen || 'No hay resumen disponible.';

  // Quitar la clase .hidden para mostrar el panel
  detailPanel.classList.remove('hidden');
  document.getElementById('content-section').classList.add('show-detail');
}

// Para ocultarlo (al hacer clic fuera), quitas la clase
function ocultarDetalle() {
  document.getElementById('content-section').classList.remove('show-detail');
}

// =========== Control de cierre del panel al hacer clic fuera ===========

// Espera a que cargue el DOM
document.addEventListener('DOMContentLoaded', () => {

  // 1) Al hacer clic en cualquier parte del documento, ocultamos el panel
  //    (excepto si se detiene la propagación en la fila o en el panel).
  document.addEventListener('click', () => {
    ocultarDetalle();
    if (selectedRow) {
      selectedRow.classList.remove('selected');
      selectedRow = null;
    } 
  });

  // Evitar que clic en el panel o en la fila lo cierre
  const detailPanel = document.getElementById('detail-panel');
  detailPanel.addEventListener('click', (e) => e.stopPropagation());
});
