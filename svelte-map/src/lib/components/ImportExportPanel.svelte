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

  const importStyle = new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: 'rgba(46, 204, 113, 0.8)' }),
      stroke: new Stroke({ color: '#27ae60', width: 2 })
    }),
    fill: new Fill({ color: 'rgba(46, 204, 113, 0.2)' }),
    stroke: new Stroke({ color: '#27ae60', width: 2 })
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
          {
            id: `import_${Date.now()}`,
            name: file.name,
            visible: true,
            opacity: 1,
            source: 'import',
            olLayer: layer
          }
        ]);

        notify(`"${file.name}" importé (${features.length} entités)`, 'success');
      } catch (err) {
        notify(`Erreur: ${err.message}`, 'error');
      }
    }

    fileInput.value = '';
  }

  function handleExport() {
    dispatch('export', { format: exportFormat });
  }
</script>

<div class="import-export-panel">
  <h3>Importer</h3>

  <p class="hint">Formats supportés : GeoJSON, KML</p>

  <button class="import-btn" on:click={() => fileInput.click()}>
    Choisir un fichier...
  </button>
  <input
    bind:this={fileInput}
    type="file"
    accept=".geojson,.json,.kml"
    multiple
    on:change={handleFileImport}
    hidden
  />

  <div class="drop-zone" on:dragover|preventDefault on:drop|preventDefault={(e) => {
    const dt = e.dataTransfer;
    if (dt.files.length) {
      handleFileImport({ target: { files: dt.files } });
    }
  }}>
    Glisser-déposer des fichiers ici
  </div>

  <h3>Exporter</h3>

  <div class="export-options">
    <label>
      <input type="radio" value="geojson" bind:group={exportFormat} />
      GeoJSON
    </label>
    <label>
      <input type="radio" value="kml" bind:group={exportFormat} />
      KML
    </label>
  </div>

  <button class="export-btn" on:click={handleExport}>
    Exporter les couches visibles
  </button>
</div>

<style>
  .import-export-panel {
    padding: 12px;
  }

  h3 {
    margin: 16px 0 8px;
    font-size: 14px;
    color: #e0e0ff;
  }

  h3:first-child {
    margin-top: 0;
  }

  .hint {
    font-size: 11px;
    color: #888;
    margin: 0 0 8px;
  }

  .import-btn {
    width: 100%;
    padding: 10px;
    background: rgba(46, 204, 113, 0.1);
    border: 1px solid rgba(46, 204, 113, 0.3);
    border-radius: 6px;
    color: #2ecc71;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
  }

  .import-btn:hover {
    background: rgba(46, 204, 113, 0.2);
  }

  .drop-zone {
    margin-top: 8px;
    padding: 24px 12px;
    border: 2px dashed #444;
    border-radius: 8px;
    text-align: center;
    font-size: 12px;
    color: #666;
    transition: all 0.2s;
  }

  .drop-zone:hover {
    border-color: #2ecc71;
    color: #2ecc71;
    background: rgba(46, 204, 113, 0.05);
  }

  .export-options {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
  }

  .export-options label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #ccc;
    cursor: pointer;
  }

  .export-options input {
    accent-color: #00a1de;
  }

  .export-btn {
    width: 100%;
    padding: 10px;
    background: #00a1de;
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: background 0.15s;
  }

  .export-btn:hover {
    background: #0086b8;
  }
</style>
