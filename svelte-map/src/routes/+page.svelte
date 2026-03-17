<script>
  import MapView from '$lib/components/MapView.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import SearchPanel from '$lib/components/SearchPanel.svelte';
  import LayersPanel from '$lib/components/LayersPanel.svelte';
  import DrawPanel from '$lib/components/DrawPanel.svelte';
  import MeasurePanel from '$lib/components/MeasurePanel.svelte';
  import ImportExportPanel from '$lib/components/ImportExportPanel.svelte';
  import PrintPanel from '$lib/components/PrintPanel.svelte';
  import Notification from '$lib/components/Notification.svelte';
  import { activeTool, drawingMode, measureMode, overlayLayers, notify } from '$lib/stores/map.js';
  import { exportToGeoJSON, exportToKML, downloadFile } from '$lib/utils/formats.js';
  import { printMap, exportMapAsPng } from '$lib/utils/print.js';
  import GeoJSON from 'ol/format/GeoJSON';

  let mapView;
  let sidebarOpen = true;

  function handleSearchSelect(e) {
    const result = e.detail;
    if (mapView) {
      mapView.zoomToCoord(result.lon, result.lat, result.bbox ? undefined : 15);
      if (result.bbox) {
        const { transformExtent } = import('ol/proj').then(({ transformExtent }) => {
          mapView.zoomToExtent(transformExtent(result.bbox, 'EPSG:4326', 'EPSG:3857'));
        });
      }
    }
  }

  function handleClearDraw() {
    if (mapView) {
      const source = mapView.getDrawSource();
      if (source) source.clear();
    }
    drawingMode.set(null);
  }

  function handleExportDraw() {
    if (!mapView) return;
    const source = mapView.getDrawSource();
    if (!source || source.getFeatures().length === 0) {
      notify('Aucun dessin à exporter', 'info');
      return;
    }
    const format = new GeoJSON();
    const json = format.writeFeatures(source.getFeatures(), {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    downloadFile(json, 'dessins.geojson');
    notify('Dessins exportés', 'success');
  }

  function handleClearMeasure() {
    if (mapView) {
      const source = mapView.getMeasureSource();
      if (source) source.clear();
      // Remove all measure overlays
      const map = mapView.getMap();
      if (map) {
        const overlays = map.getOverlays().getArray().slice();
        overlays.forEach((o) => {
          const el = o.getElement();
          if (el && el.classList.contains('measure-tooltip-static')) {
            map.removeOverlay(o);
          }
        });
      }
    }
    measureMode.set(null);
  }

  function handleExportLayers(e) {
    const format = e.detail.format;
    if (!mapView) return;

    // Collect all visible vector features
    const allFeatures = [];
    const map = mapView.getMap();

    // From overlayLayers
    $overlayLayers.forEach((layer) => {
      if (layer.visible && layer.olLayer) {
        const source = layer.olLayer.getSource?.();
        if (source?.getFeatures) {
          allFeatures.push(...source.getFeatures());
        }
      }
    });

    // From draw layer
    const drawSource = mapView.getDrawSource();
    if (drawSource) allFeatures.push(...drawSource.getFeatures());

    if (allFeatures.length === 0) {
      notify('Aucune entité à exporter', 'info');
      return;
    }

    if (format === 'geojson') {
      const json = exportToGeoJSON(allFeatures);
      downloadFile(json, 'export.geojson');
    } else {
      const kml = exportToKML(allFeatures);
      downloadFile(kml, 'export.kml', 'application/vnd.google-earth.kml+xml');
    }
    notify('Export terminé', 'success');
  }

  function handlePrint() {
    if (mapView) {
      const el = mapView.getMapElement();
      if (el) printMap(el);
    }
  }

  function handleExportPng() {
    if (mapView) {
      const map = mapView.getMap();
      if (map) {
        map.once('rendercomplete', () => {
          const el = mapView.getMapElement();
          if (el) exportMapAsPng(el);
        });
        map.renderSync();
      }
    }
  }

  function handleGeolocate() {
    if (mapView) mapView.geolocate();
  }
</script>

<svelte:head>
  <title>IGO2 Svelte Map</title>
</svelte:head>

<div class="app">
  <header class="app-header">
    <button class="menu-btn" on:click={() => (sidebarOpen = !sidebarOpen)}>
      {sidebarOpen ? '◀' : '▶'}
    </button>
    <h1>IGO2 <span class="subtitle">Svelte Map</span></h1>
    <div class="header-spacer"></div>
    <span class="coords-display">Québec, Canada</span>
  </header>

  <div class="main">
    {#if sidebarOpen}
      <aside class="sidebar">
        <Toolbar />
        <div class="panel-content">
          {#if $activeTool === 'search'}
            <SearchPanel on:select={handleSearchSelect} />
          {:else if $activeTool === 'layers'}
            <LayersPanel />
          {:else if $activeTool === 'draw'}
            <DrawPanel on:clear={handleClearDraw} on:export={handleExportDraw} />
          {:else if $activeTool === 'measure'}
            <MeasurePanel on:clear={handleClearMeasure} />
          {:else if $activeTool === 'import'}
            <ImportExportPanel on:export={handleExportLayers} />
          {:else if $activeTool === 'print'}
            <PrintPanel
              on:print={handlePrint}
              on:exportpng={handleExportPng}
              on:geolocate={handleGeolocate}
            />
          {:else}
            <div class="welcome">
              <h2>Bienvenue</h2>
              <p>Infrastructure Géomatique Ouverte</p>
              <div class="feature-list">
                <div class="feature-item" on:click={() => activeTool.set('search')}>
                  <span>🔍</span> Recherche d'adresse
                </div>
                <div class="feature-item" on:click={() => activeTool.set('layers')}>
                  <span>🗂</span> Gestion des couches
                </div>
                <div class="feature-item" on:click={() => activeTool.set('draw')}>
                  <span>✏️</span> Outils de dessin
                </div>
                <div class="feature-item" on:click={() => activeTool.set('measure')}>
                  <span>📏</span> Mesures
                </div>
                <div class="feature-item" on:click={() => activeTool.set('import')}>
                  <span>📥</span> Import / Export
                </div>
                <div class="feature-item" on:click={() => activeTool.set('print')}>
                  <span>🖨</span> Impression
                </div>
              </div>
              <p class="version">v1.0 — Propulsé par OpenLayers & Svelte</p>
            </div>
          {/if}
        </div>
      </aside>
    {/if}

    <div class="map-area">
      <MapView bind:this={mapView} />

      <div class="map-controls">
        <button class="map-btn" on:click={handleGeolocate} title="Ma position">📍</button>
      </div>
    </div>
  </div>

  <Notification />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .app-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 48px;
    background: #1a1a2e;
    border-bottom: 1px solid #2a2a4a;
    flex-shrink: 0;
  }

  .menu-btn {
    background: none;
    border: none;
    color: #a0a0c0;
    cursor: pointer;
    font-size: 16px;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .menu-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  h1 {
    font-size: 16px;
    font-weight: 700;
    color: #00a1de;
    white-space: nowrap;
  }

  .subtitle {
    font-weight: 400;
    color: #a0a0c0;
    font-size: 14px;
  }

  .header-spacer {
    flex: 1;
  }

  .coords-display {
    font-size: 11px;
    color: #666;
  }

  .main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    display: flex;
    width: 360px;
    flex-shrink: 0;
    background: #16162b;
    border-right: 1px solid #2a2a4a;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .panel-content::-webkit-scrollbar {
    width: 6px;
  }

  .panel-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .panel-content::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }

  .map-area {
    flex: 1;
    position: relative;
  }

  .map-controls {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 100;
  }

  .map-btn {
    width: 36px;
    height: 36px;
    background: rgba(26, 26, 46, 0.9);
    border: 1px solid #333;
    border-radius: 6px;
    color: #e0e0ff;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .map-btn:hover {
    background: rgba(0, 161, 222, 0.3);
    border-color: #00a1de;
  }

  /* Welcome panel */
  .welcome {
    padding: 20px 16px;
    text-align: center;
  }

  .welcome h2 {
    font-size: 18px;
    color: #e0e0ff;
    margin-bottom: 4px;
  }

  .welcome p {
    font-size: 12px;
    color: #888;
    margin-bottom: 20px;
  }

  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    font-size: 13px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.15s;
  }

  .feature-item:hover {
    background: rgba(0, 161, 222, 0.1);
    color: #00a1de;
  }

  .feature-item span {
    font-size: 18px;
  }

  .version {
    margin-top: 24px;
    font-size: 10px;
    color: #555;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 1000;
      width: 320px;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
    }
  }
</style>
