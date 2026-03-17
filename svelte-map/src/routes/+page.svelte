<script>
  import { onMount } from 'svelte';
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

  onMount(() => {
    if (window.innerWidth <= 768) sidebarOpen = false;
  });

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

    const allFeatures = [];
    const map = mapView.getMap();

    $overlayLayers.forEach((layer) => {
      if (layer.visible && layer.olLayer) {
        const source = layer.olLayer.getSource?.();
        if (source?.getFeatures) {
          allFeatures.push(...source.getFeatures());
        }
      }
    });

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

  function closeSidebar() {
    sidebarOpen = false;
  }
</script>

<svelte:head>
  <title>IGO2 Svelte Map</title>
</svelte:head>

<div class="app">
  <header class="app-header">
    <button class="menu-btn" on:click={() => (sidebarOpen = !sidebarOpen)} aria-label="Ouvrir/fermer le menu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        {#if sidebarOpen}
          <path d="M6 4l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
        {:else}
          <rect y="3" width="20" height="2" rx="1"/>
          <rect y="9" width="20" height="2" rx="1"/>
          <rect y="15" width="20" height="2" rx="1"/>
        {/if}
      </svg>
    </button>
    <div class="header-brand">
      <span class="header-logo" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5"/>
          <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" stroke="white" stroke-width="1.5"/>
        </svg>
      </span>
      <h1>IGO2 <span class="subtitle">Svelte Map</span></h1>
    </div>
    <div class="header-spacer"></div>
    <span class="coords-display">Québec, Canada</span>
  </header>

  <div class="main">
    {#if sidebarOpen}
      <!-- Backdrop mobile -->
      <div class="sidebar-backdrop" on:click={closeSidebar} role="presentation"></div>

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
              <div class="welcome-logo" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--qc-blue)" stroke-width="1.5"/>
                  <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" stroke="var(--qc-blue)" stroke-width="1.5"/>
                </svg>
              </div>
              <h2>Bienvenue</h2>
              <p>Infrastructure Géomatique Ouverte</p>
              <nav class="feature-list" aria-label="Outils disponibles">
                <button class="feature-item" on:click={() => activeTool.set('search')}>
                  <span class="feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  </span>
                  Recherche d'adresse
                </button>
                <button class="feature-item" on:click={() => activeTool.set('layers')}>
                  <span class="feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                  </span>
                  Gestion des couches
                </button>
                <button class="feature-item" on:click={() => activeTool.set('draw')}>
                  <span class="feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </span>
                  Outils de dessin
                </button>
                <button class="feature-item" on:click={() => activeTool.set('measure')}>
                  <span class="feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4"/></svg>
                  </span>
                  Mesures
                </button>
                <button class="feature-item" on:click={() => activeTool.set('import')}>
                  <span class="feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </span>
                  Import / Export
                </button>
                <button class="feature-item" on:click={() => activeTool.set('print')}>
                  <span class="feature-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  </span>
                  Impression
                </button>
              </nav>
              <p class="version">v1.0 — OpenLayers &amp; Svelte</p>
            </div>
          {/if}
        </div>
      </aside>
    {/if}

    <div class="map-area">
      <MapView bind:this={mapView} />

      <div class="map-controls">
        <button class="map-btn" on:click={handleGeolocate} title="Ma position" aria-label="Ma position">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <circle cx="12" cy="12" r="8" stroke-dasharray="2 2"/>
          </svg>
        </button>
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
    height: 100dvh;
    width: 100vw;
    overflow: hidden;
  }

  /* ── En-tête ─────────────────────────────────────────────────────────── */
  .app-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 56px;
    background: var(--qc-blue-piv);
    flex-shrink: 0;
    /* Safe area pour iPhone notch */
    padding-top: env(safe-area-inset-top);
  }

  .menu-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    padding: 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    transition: background 0.15s;
  }

  .menu-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-logo {
    display: flex;
    align-items: center;
    opacity: 0.9;
  }

  h1 {
    font-size: 17px;
    font-weight: 700;
    color: white;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .subtitle {
    font-weight: 400;
    color: rgba(255, 255, 255, 0.75);
    font-size: 15px;
  }

  .header-spacer {
    flex: 1;
  }

  .coords-display {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    white-space: nowrap;
  }

  /* ── Layout principal ────────────────────────────────────────────────── */
  .main {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* ── Sidebar (desktop : gauche, mobile : bottom sheet) ───────────────── */
  .sidebar {
    display: flex;
    width: 360px;
    flex-shrink: 0;
    background: var(--qc-white);
    border-right: 1px solid var(--qc-gray-light);
    overflow: hidden;
  }

  .sidebar-backdrop {
    display: none;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--qc-white);
  }

  .panel-content::-webkit-scrollbar {
    width: 6px;
  }

  .panel-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .panel-content::-webkit-scrollbar-thumb {
    background: var(--qc-gray-light);
    border-radius: 3px;
  }

  /* ── Carte ───────────────────────────────────────────────────────────── */
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
    gap: 6px;
    z-index: 100;
  }

  .map-btn {
    width: 44px;
    height: 44px;
    background: var(--qc-white);
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    color: var(--qc-blue-dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(34, 54, 84, 0.12);
    transition: all 0.15s;
  }

  .map-btn:hover {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue);
    color: var(--qc-blue);
  }

  /* ── Panneau d'accueil ───────────────────────────────────────────────── */
  .welcome {
    padding: 24px 16px;
    text-align: center;
  }

  .welcome-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .welcome h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--qc-blue-dark);
    margin-bottom: 4px;
  }

  .welcome > p {
    font-size: 13px;
    color: var(--qc-gray);
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
    gap: 12px;
    padding: 12px 14px;
    background: var(--qc-gray-pale);
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 14px;
    color: var(--qc-blue-dark);
    cursor: pointer;
    transition: all 0.15s;
    width: 100%;
    text-align: left;
    min-height: 44px;
  }

  .feature-item:hover {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue-clear);
    color: var(--qc-blue);
  }

  .feature-icon {
    display: flex;
    align-items: center;
    color: var(--qc-blue);
    flex-shrink: 0;
  }

  .version {
    margin-top: 24px;
    font-size: 11px;
    color: var(--qc-gray);
  }

  /* ── Responsive mobile ───────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .app-header {
      height: 52px;
    }

    .coords-display {
      display: none;
    }

    /* Backdrop semi-transparent sur la carte */
    .sidebar-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(34, 54, 84, 0.35);
      z-index: 999;
    }

    /* Bottom sheet */
    .sidebar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      width: 100%;
      max-height: 65vh;
      flex-direction: column;
      border-right: none;
      border-top: 2px solid var(--qc-blue-piv);
      border-radius: 16px 16px 0 0;
      box-shadow: 0 -4px 24px rgba(34, 54, 84, 0.2);
      z-index: 1000;
      /* Safe area pour iPhone bas d'écran */
      padding-bottom: env(safe-area-inset-bottom);
    }

    /* Indicateur de glissement */
    .sidebar::before {
      content: '';
      display: block;
      width: 40px;
      height: 4px;
      background: var(--qc-gray-light);
      border-radius: 2px;
      margin: 10px auto 0;
      flex-shrink: 0;
    }

    .panel-content {
      padding-bottom: 8px;
    }
  }
</style>
