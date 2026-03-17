<script>
  import { overlayLayers, notify } from '../stores/map.js';
  import { readFeaturesFromFile, exportToGeoJSON, exportToKML, downloadFile } from '../utils/formats.js';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let fileInput;
  let exportFormat = 'geojson';
  let dragOver = false;

  const importStyle = new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: 'rgba(79, 129, 61, 0.8)' }),
      stroke: new Stroke({ color: '#4F813D', width: 2 })
    }),
    fill: new Fill({ color: 'rgba(79, 129, 61, 0.2)' }),
    stroke: new Stroke({ color: '#4F813D', width: 2 })
  });

  async function handleFileImport(e) {
    const files = e.target.files;
    if (!files.length) return;

    for (const file of files) {
      try {
        const features = await readFeaturesFromFile(file);
        const source = new VectorSource({ features });
        const layer = new VectorLayer({ source, style: importStyle, zIndex: 60 });

        overlayLayers.update((layers) => [
          ...layers,
          { id: `import_${Date.now()}`, name: file.name, visible: true, opacity: 1, source: 'import', olLayer: layer }
        ]);

        notify(`"${file.name}" importé (${features.length} entités)`, 'success');
      } catch (err) {
        notify(`Erreur: ${err.message}`, 'error');
      }
    }

    fileInput.value = '';
  }

  function handleDrop(e) {
    dragOver = false;
    const dt = e.dataTransfer;
    if (dt.files.length) handleFileImport({ target: { files: dt.files } });
  }

  function handleExport() {
    dispatch('export', { format: exportFormat });
  }
</script>

<div class="import-export-panel">
  <h3>Importer</h3>

  <p class="hint">Formats supportés : GeoJSON, KML</p>

  <button class="import-btn" on:click={() => fileInput.click()}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    Choisir un fichier…
  </button>

  <input
    bind:this={fileInput}
    type="file"
    accept=".geojson,.json,.kml"
    multiple
    on:change={handleFileImport}
    hidden
    aria-hidden="true"
  />

  <div
    class="drop-zone"
    class:drag-over={dragOver}
    role="button"
    tabindex="0"
    aria-label="Zone de glisser-déposer pour importer des fichiers"
    on:dragover|preventDefault={() => (dragOver = true)}
    on:dragleave={() => (dragOver = false)}
    on:drop|preventDefault={handleDrop}
    on:keydown={(e) => e.key === 'Enter' && fileInput.click()}
    on:click={() => fileInput.click()}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    <span>Glisser-déposer des fichiers ici</span>
  </div>

  <div class="sep"></div>

  <h3>Exporter</h3>

  <div class="export-options" role="radiogroup" aria-label="Format d'export">
    <label class="radio-option" class:selected={exportFormat === 'geojson'}>
      <input type="radio" value="geojson" bind:group={exportFormat} />
      GeoJSON
    </label>
    <label class="radio-option" class:selected={exportFormat === 'kml'}>
      <input type="radio" value="kml" bind:group={exportFormat} />
      KML
    </label>
  </div>

  <button class="export-btn" on:click={handleExport}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Exporter les couches visibles
  </button>
</div>

<style>
  .import-export-panel {
    padding: 16px;
  }

  h3 {
    margin: 20px 0 10px;
    font-size: 15px;
    font-weight: 700;
    color: var(--qc-blue-dark);
    border-bottom: 2px solid var(--qc-blue-piv);
    padding-bottom: 8px;
  }

  h3:first-child {
    margin-top: 0;
  }

  .hint {
    font-size: 13px;
    color: var(--qc-gray);
    margin: 0 0 10px;
  }

  .import-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 11px;
    background: var(--qc-white);
    border: 1px solid var(--qc-blue-clear);
    border-radius: 6px;
    color: var(--qc-blue);
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    font-weight: 600;
    transition: all 0.15s;
    min-height: 44px;
  }

  .import-btn:hover {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue);
  }

  .drop-zone {
    margin-top: 10px;
    padding: 24px 16px;
    border: 2px dashed var(--qc-gray-light);
    border-radius: 8px;
    text-align: center;
    font-size: 13px;
    color: var(--qc-gray);
    transition: all 0.2s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .drop-zone:hover,
  .drop-zone.drag-over {
    border-color: var(--qc-blue);
    color: var(--qc-blue);
    background: var(--qc-blue-light);
  }

  .sep {
    height: 1px;
    background: var(--qc-gray-light);
    margin: 16px 0 4px;
  }

  .export-options {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }

  .radio-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--qc-blue-dark);
    cursor: pointer;
    transition: all 0.15s;
    min-height: 44px;
    background: var(--qc-white);
  }

  .radio-option:hover {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue-clear);
  }

  .radio-option.selected {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue-piv);
    color: var(--qc-blue-piv);
  }

  .radio-option input {
    accent-color: var(--qc-blue-piv);
    width: 16px;
    height: 16px;
  }

  .export-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 11px;
    background: var(--qc-blue-piv);
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    font-weight: 700;
    transition: background 0.15s;
    min-height: 44px;
  }

  .export-btn:hover {
    background: var(--qc-blue);
  }
</style>
