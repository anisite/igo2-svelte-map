<script>
  import { overlayLayers, activeBaseLayer, notify } from '../stores/map.js';
  import TileLayer from 'ol/layer/Tile';
  import TileWMS from 'ol/source/TileWMS';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import GeoJSON from 'ol/format/GeoJSON';

  const baseLayerOptions = [
    { id: 'gouvqc',       name: 'Gouvernement du Québec' },
    { id: 'osm',       name: 'OpenStreetMap' },
    { id: 'osmHot',    name: 'OSM Humanitaire' },
    { id: 'cartoLight',name: 'Carto Clair' },
    { id: 'cartoDark', name: 'Carto Sombre' },
    { id: 'none',      name: 'Aucun fond' }
  ];

  let showAddLayer = false;
  let layerType = 'wms';
  let layerUrl = '';
  let layerName = '';
  let layerTitle = '';

  const catalog = [
    { title: 'Routes du Québec',   type: 'wms', url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',           name: 'bgr_v_sous_route_res_sup_act' },
    { title: 'Limites municipales', type: 'wms', url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi', name: 'MSP_DESSERTE_MUN_911' }
  ];

  function addLayerFromForm() {
    if (!layerUrl || !layerName) { notify('URL et nom de couche requis', 'error'); return; }
    const id = `layer_${Date.now()}`;
    let olLayer;
    if (layerType === 'wms') {
      olLayer = new TileLayer({ source: new TileWMS({ url: layerUrl, params: { LAYERS: layerName, TILED: true }, serverType: 'mapserver' }), zIndex: 50 });
    } else if (layerType === 'geojson') {
      olLayer = new VectorLayer({ source: new VectorSource({ url: layerUrl, format: new GeoJSON() }), zIndex: 50 });
    }
    overlayLayers.update((layers) => [...layers, { id, name: layerTitle || layerName, visible: true, opacity: 1, source: layerType, olLayer }]);
    layerUrl = ''; layerName = ''; layerTitle = ''; showAddLayer = false;
    notify('Couche ajoutée', 'success');
  }

  function addFromCatalog(item) {
    const id = `layer_${Date.now()}`;
    const olLayer = new TileLayer({ source: new TileWMS({ url: item.url, params: { LAYERS: item.name, TILED: true }, serverType: 'mapserver' }), zIndex: 50 });
    overlayLayers.update((layers) => [...layers, { id, name: item.title, visible: true, opacity: 1, source: 'wms', olLayer }]);
    notify(`Couche "${item.title}" ajoutée`, 'success');
  }

  function toggleVisibility(layerId) {
    overlayLayers.update((layers) => layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)));
  }

  function updateOpacity(layerId, value) {
    overlayLayers.update((layers) => layers.map((l) => (l.id === layerId ? { ...l, opacity: parseFloat(value) } : l)));
  }

  function removeLayer(layerId) {
    overlayLayers.update((layers) => layers.filter((l) => l.id !== layerId));
  }

  function moveLayer(layerId, direction) {
    overlayLayers.update((layers) => {
      const idx = layers.findIndex((l) => l.id === layerId);
      if (idx < 0) return layers;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= layers.length) return layers;
      const copy = [...layers];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }
</script>

<div class="layers-panel">
  <h3>Fond de carte</h3>
  <div class="base-layers" role="radiogroup" aria-label="Fond de carte">
    {#each baseLayerOptions as bl}
      <label class="base-option" class:selected={$activeBaseLayer === bl.id}>
        <input type="radio" name="base" value={bl.id} bind:group={$activeBaseLayer} />
        {bl.name}
      </label>
    {/each}
  </div>

  <h3>Couches superposées</h3>

  {#if $overlayLayers.length === 0}
    <p class="empty">Aucune couche ajoutée</p>
  {/if}

  <div class="overlay-list">
    {#each $overlayLayers as layer, i}
      <div class="layer-item">
        <div class="layer-header">
          <button class="vis-btn" on:click={() => toggleVisibility(layer.id)} title={layer.visible ? 'Masquer' : 'Afficher'} aria-label={layer.visible ? 'Masquer la couche' : 'Afficher la couche'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              {#if layer.visible}
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              {:else}
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              {/if}
            </svg>
          </button>
          <span class="layer-name" title={layer.name}>{layer.name}</span>
          <div class="layer-actions">
            <button on:click={() => moveLayer(layer.id, -1)} title="Monter" aria-label="Monter la couche" disabled={i === 0}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button on:click={() => moveLayer(layer.id, 1)} title="Descendre" aria-label="Descendre la couche" disabled={i === $overlayLayers.length - 1}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button class="remove-btn" on:click={() => removeLayer(layer.id)} title="Supprimer" aria-label="Supprimer la couche">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="opacity-row">
          <label class="opacity-label" for="opacity-{layer.id}">Opacité</label>
          <input
            id="opacity-{layer.id}"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={layer.opacity}
            on:input={(e) => updateOpacity(layer.id, e.target.value)}
            aria-label="Opacité de la couche {layer.name}"
          />
          <span class="opacity-val">{Math.round(layer.opacity * 100)}%</span>
        </div>
      </div>
    {/each}
  </div>

  <h3>Catalogue</h3>
  <div class="catalog">
    {#each catalog as item}
      <button class="catalog-item" on:click={() => addFromCatalog(item)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        {item.title}
      </button>
    {/each}
  </div>

  <button class="add-btn" on:click={() => (showAddLayer = !showAddLayer)}>
    {#if showAddLayer}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Annuler
    {:else}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Ajouter une couche
    {/if}
  </button>

  {#if showAddLayer}
    <div class="add-form">
      <label class="form-label">
        Type
        <select bind:value={layerType}>
          <option value="wms">WMS</option>
          <option value="geojson">GeoJSON (URL)</option>
        </select>
      </label>
      <label class="form-label">
        URL du service
        <input type="url" placeholder="https://..." bind:value={layerUrl} />
      </label>
      {#if layerType === 'wms'}
        <label class="form-label">
          Nom de la couche (LAYERS)
          <input type="text" placeholder="nom_couche" bind:value={layerName} />
        </label>
      {/if}
      <label class="form-label">
        Titre (optionnel)
        <input type="text" placeholder="Mon titre" bind:value={layerTitle} />
      </label>
      <button class="submit-btn" on:click={addLayerFromForm}>Ajouter la couche</button>
    </div>
  {/if}
</div>

<style>
  .layers-panel {
    padding: 16px;
  }

  h3 {
    margin: 20px 0 10px;
    font-size: 13px;
    font-weight: 700;
    color: var(--qc-blue-medium);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid var(--qc-gray-light);
    padding-bottom: 6px;
  }

  h3:first-child {
    margin-top: 0;
  }

  /* ── Fond de carte ───────────────────────────────────────────────────── */
  .base-layers {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .base-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    font-size: 14px;
    color: var(--qc-blue-dark);
    cursor: pointer;
    border-radius: 6px;
    border: 1px solid transparent;
    transition: all 0.15s;
    min-height: 44px;
  }

  .base-option:hover {
    background: var(--qc-blue-light);
  }

  .base-option.selected {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue-clear);
    color: var(--qc-blue);
    font-weight: 600;
  }

  .base-option input {
    accent-color: var(--qc-blue-piv);
    width: 16px;
    height: 16px;
  }

  /* ── Couches superposées ─────────────────────────────────────────────── */
  .empty {
    font-size: 13px;
    color: var(--qc-gray);
    text-align: center;
    padding: 16px;
    background: var(--qc-gray-pale);
    border-radius: 6px;
  }

  .overlay-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .layer-item {
    background: var(--qc-gray-pale);
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    padding: 10px;
  }

  .layer-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .vis-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--qc-gray);
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    min-width: 28px;
    min-height: 28px;
    justify-content: center;
  }

  .vis-btn:hover {
    background: var(--qc-blue-light);
    color: var(--qc-blue);
  }

  .layer-name {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--qc-blue-dark);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .layer-actions {
    display: flex;
    gap: 2px;
  }

  .layer-actions button {
    background: none;
    border: none;
    color: var(--qc-gray);
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 28px;
  }

  .layer-actions button:hover:not(:disabled) {
    background: var(--qc-blue-light);
    color: var(--qc-blue);
  }

  .layer-actions button:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .remove-btn:hover:not(:disabled) {
    background: var(--qc-red-pale) !important;
    color: var(--qc-red) !important;
  }

  .opacity-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }

  .opacity-label {
    font-size: 11px;
    color: var(--qc-gray);
    width: 46px;
    flex-shrink: 0;
  }

  .opacity-row input[type='range'] {
    flex: 1;
    accent-color: var(--qc-blue-piv);
  }

  .opacity-val {
    font-size: 11px;
    color: var(--qc-gray);
    width: 32px;
    text-align: right;
  }

  /* ── Catalogue ───────────────────────────────────────────────────────── */
  .catalog {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .catalog-item {
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
    padding: 10px 12px;
    background: var(--qc-white);
    border: 1px solid var(--qc-blue-clear);
    border-radius: 6px;
    color: var(--qc-blue);
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    font-weight: 600;
    transition: all 0.15s;
    min-height: 44px;
  }

  .catalog-item:hover {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue);
  }

  /* ── Bouton ajouter ──────────────────────────────────────────────────── */
  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-top: 12px;
    padding: 11px;
    background: var(--qc-white);
    border: 1px dashed var(--qc-gray-light);
    border-radius: 6px;
    color: var(--qc-gray-dark);
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    transition: all 0.15s;
    min-height: 44px;
  }

  .add-btn:hover {
    border-color: var(--qc-blue);
    color: var(--qc-blue);
    background: var(--qc-blue-light);
  }

  /* ── Formulaire ──────────────────────────────────────────────────────── */
  .add-form {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: var(--qc-gray-pale);
    border-radius: 6px;
    border: 1px solid var(--qc-gray-light);
  }

  .form-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    color: var(--qc-blue-medium);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .add-form select,
  .add-form input {
    padding: 9px 11px;
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    background: var(--qc-white);
    color: var(--qc-blue-dark);
    font-size: 14px;
    font-family: inherit;
    outline: none;
    min-height: 44px;
  }

  .add-form select:focus,
  .add-form input:focus {
    border-color: var(--qc-blue);
    box-shadow: 0 0 0 3px rgba(20, 114, 191, 0.2);
  }

  .submit-btn {
    padding: 11px;
    background: var(--qc-blue-piv);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    font-weight: 700;
    transition: background 0.15s;
    min-height: 44px;
  }

  .submit-btn:hover {
    background: var(--qc-blue);
  }
</style>
