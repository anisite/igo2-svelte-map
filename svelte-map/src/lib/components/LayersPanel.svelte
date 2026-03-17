<script>
  import { overlayLayers, activeBaseLayer, notify } from '../stores/map.js';
  import TileLayer from 'ol/layer/Tile';
  import TileWMS from 'ol/source/TileWMS';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import GeoJSON from 'ol/format/GeoJSON';

  const baseLayerOptions = [
    { id: 'osm', name: 'OpenStreetMap' },
    { id: 'osmHot', name: 'OSM Humanitaire' },
    { id: 'cartoLight', name: 'Carto Clair' },
    { id: 'cartoDark', name: 'Carto Sombre' },
    { id: 'none', name: 'Aucun fond' }
  ];

  let showAddLayer = false;
  let layerType = 'wms';
  let layerUrl = '';
  let layerName = '';
  let layerTitle = '';

  // Predefined catalog (inspired by IGO2 Quebec services)
  const catalog = [
    {
      title: 'Routes du Québec',
      type: 'wms',
      url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
      name: 'bgr_v_sous_route_res_sup_act'
    },
    {
      title: 'Limites municipales',
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
      name: 'MSP_DESSERTE_MUN_911'
    }
  ];

  function addLayerFromForm() {
    if (!layerUrl || !layerName) {
      notify('URL et nom de couche requis', 'error');
      return;
    }

    const id = `layer_${Date.now()}`;
    let olLayer;

    if (layerType === 'wms') {
      olLayer = new TileLayer({
        source: new TileWMS({
          url: layerUrl,
          params: { LAYERS: layerName, TILED: true },
          serverType: 'mapserver'
        }),
        zIndex: 50
      });
    } else if (layerType === 'geojson') {
      olLayer = new VectorLayer({
        source: new VectorSource({
          url: layerUrl,
          format: new GeoJSON()
        }),
        zIndex: 50
      });
    }

    overlayLayers.update((layers) => [
      ...layers,
      {
        id,
        name: layerTitle || layerName,
        visible: true,
        opacity: 1,
        source: layerType,
        olLayer
      }
    ]);

    layerUrl = '';
    layerName = '';
    layerTitle = '';
    showAddLayer = false;
    notify('Couche ajoutée', 'success');
  }

  function addFromCatalog(item) {
    const id = `layer_${Date.now()}`;
    const olLayer = new TileLayer({
      source: new TileWMS({
        url: item.url,
        params: { LAYERS: item.name, TILED: true },
        serverType: 'mapserver'
      }),
      zIndex: 50
    });

    overlayLayers.update((layers) => [
      ...layers,
      { id, name: item.title, visible: true, opacity: 1, source: 'wms', olLayer }
    ]);
    notify(`Couche "${item.title}" ajoutée`, 'success');
  }

  function toggleVisibility(layerId) {
    overlayLayers.update((layers) =>
      layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  }

  function updateOpacity(layerId, value) {
    overlayLayers.update((layers) =>
      layers.map((l) => (l.id === layerId ? { ...l, opacity: parseFloat(value) } : l))
    );
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
  <div class="base-layers">
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
          <button class="vis-btn" on:click={() => toggleVisibility(layer.id)} title="Visibilité">
            {layer.visible ? '👁' : '👁‍🗨'}
          </button>
          <span class="layer-name">{layer.name}</span>
          <div class="layer-actions">
            <button on:click={() => moveLayer(layer.id, -1)} title="Monter" disabled={i === 0}>▲</button>
            <button on:click={() => moveLayer(layer.id, 1)} title="Descendre" disabled={i === $overlayLayers.length - 1}>▼</button>
            <button class="remove-btn" on:click={() => removeLayer(layer.id)} title="Supprimer">✕</button>
          </div>
        </div>
        <div class="opacity-row">
          <span class="opacity-label">Opacité</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={layer.opacity}
            on:input={(e) => updateOpacity(layer.id, e.target.value)}
          />
        </div>
      </div>
    {/each}
  </div>

  <h3>Catalogue</h3>
  <div class="catalog">
    {#each catalog as item}
      <button class="catalog-item" on:click={() => addFromCatalog(item)}>
        <span>+ {item.title}</span>
      </button>
    {/each}
  </div>

  <button class="add-btn" on:click={() => (showAddLayer = !showAddLayer)}>
    {showAddLayer ? '− Annuler' : '+ Ajouter une couche'}
  </button>

  {#if showAddLayer}
    <div class="add-form">
      <select bind:value={layerType}>
        <option value="wms">WMS</option>
        <option value="geojson">GeoJSON (URL)</option>
      </select>

      <input type="text" placeholder="URL du service" bind:value={layerUrl} />

      {#if layerType === 'wms'}
        <input type="text" placeholder="Nom de la couche (LAYERS)" bind:value={layerName} />
      {/if}

      <input type="text" placeholder="Titre (optionnel)" bind:value={layerTitle} />

      <button class="submit-btn" on:click={addLayerFromForm}>Ajouter</button>
    </div>
  {/if}
</div>

<style>
  .layers-panel {
    padding: 12px;
  }

  h3 {
    margin: 16px 0 8px;
    font-size: 13px;
    color: #e0e0ff;
    border-bottom: 1px solid #333;
    padding-bottom: 4px;
  }

  h3:first-child {
    margin-top: 0;
  }

  .base-layers {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .base-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    font-size: 12px;
    color: #ccc;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;
  }

  .base-option:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .base-option.selected {
    background: rgba(0, 161, 222, 0.15);
    color: #00a1de;
  }

  .base-option input {
    accent-color: #00a1de;
  }

  .empty {
    font-size: 12px;
    color: #666;
    text-align: center;
    padding: 12px;
  }

  .overlay-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .layer-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 8px;
  }

  .layer-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .vis-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 2px;
  }

  .layer-name {
    flex: 1;
    font-size: 12px;
    color: #ddd;
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
    color: #888;
    cursor: pointer;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .layer-actions button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #ddd;
  }

  .layer-actions button:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .remove-btn {
    color: #e74c3c !important;
  }

  .opacity-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .opacity-label {
    font-size: 10px;
    color: #888;
    width: 45px;
  }

  .opacity-row input[type='range'] {
    flex: 1;
    accent-color: #00a1de;
    height: 4px;
  }

  .catalog {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .catalog-item {
    text-align: left;
    padding: 8px 10px;
    background: rgba(0, 161, 222, 0.08);
    border: 1px solid rgba(0, 161, 222, 0.2);
    border-radius: 6px;
    color: #00a1de;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.15s;
  }

  .catalog-item:hover {
    background: rgba(0, 161, 222, 0.15);
  }

  .add-btn {
    width: 100%;
    margin-top: 12px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px dashed #555;
    border-radius: 6px;
    color: #aaa;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
  }

  .add-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: #888;
  }

  .add-form {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .add-form select,
  .add-form input {
    padding: 8px 10px;
    border: 1px solid #333;
    border-radius: 6px;
    background: #1a1a2e;
    color: #e0e0ff;
    font-size: 12px;
    outline: none;
  }

  .add-form select:focus,
  .add-form input:focus {
    border-color: #00a1de;
  }

  .submit-btn {
    padding: 10px;
    background: #00a1de;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: background 0.15s;
  }

  .submit-btn:hover {
    background: #0086b8;
  }
</style>
