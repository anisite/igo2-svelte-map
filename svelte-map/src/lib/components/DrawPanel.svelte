<script>
  import { drawingMode, notify } from '../stores/map.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const modes = [
    { id: 'Point',      label: 'Point',    svgPath: '<circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="8"/>' },
    { id: 'LineString', label: 'Ligne',    svgPath: '<polyline points="4 20 10 8 16 14 20 6"/>' },
    { id: 'Polygon',    label: 'Polygone', svgPath: '<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>' },
    { id: 'Circle',     label: 'Cercle',   svgPath: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/>' }
  ];

  function setMode(id) {
    drawingMode.update((v) => (v === id ? null : id));
  }

  function clearDrawings() {
    dispatch('clear');
    notify('Dessins effacés', 'info');
  }

  function exportDrawings() {
    dispatch('export');
  }
</script>

<div class="draw-panel">
  <h3>Outils de dessin</h3>

  <div class="modes">
    {#each modes as mode}
      <button
        class="mode-btn"
        class:active={$drawingMode === mode.id}
        on:click={() => setMode(mode.id)}
        aria-pressed={$drawingMode === mode.id}
      >
        <span class="mode-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            {@html mode.svgPath}
          </svg>
        </span>
        <span>{mode.label}</span>
      </button>
    {/each}
  </div>

  {#if $drawingMode}
    <div class="instruction" role="status" aria-live="polite">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Cliquez sur la carte pour dessiner.
      {#if $drawingMode === 'Polygon' || $drawingMode === 'LineString'}
        Double-cliquez pour terminer.
      {/if}
    </div>
  {/if}

  <div class="actions">
    <button class="action-btn" on:click={clearDrawings}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
      Effacer tout
    </button>
    <button class="action-btn primary" on:click={exportDrawings}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Exporter GeoJSON
    </button>
  </div>

  <p class="tip">
    Les sommets peuvent être déplacés par cliquer-glisser après la création.
  </p>
</div>

<style>
  .draw-panel {
    padding: 16px;
  }

  h3 {
    margin: 0 0 14px;
    font-size: 15px;
    font-weight: 700;
    color: var(--qc-blue-dark);
    border-bottom: 2px solid var(--qc-blue-piv);
    padding-bottom: 8px;
  }

  .modes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 8px;
    background: var(--qc-gray-pale);
    border: 2px solid var(--qc-gray-light);
    border-radius: 8px;
    color: var(--qc-blue-dark);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 13px;
    font-family: inherit;
    font-weight: 600;
    min-height: 72px;
  }

  .mode-btn:hover {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue-clear);
    color: var(--qc-blue);
  }

  .mode-btn.active {
    background: var(--qc-blue-light);
    border-color: var(--qc-blue-piv);
    color: var(--qc-blue-piv);
  }

  .mode-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .instruction {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 14px;
    padding: 12px;
    background: var(--qc-blue-light);
    border-left: 3px solid var(--qc-blue);
    border-radius: 0 6px 6px 0;
    font-size: 13px;
    color: var(--qc-blue-medium);
    line-height: 1.4;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 8px;
    background: var(--qc-white);
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    color: var(--qc-gray-dark);
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    font-weight: 600;
    transition: all 0.15s;
    min-height: 44px;
  }

  .action-btn:hover {
    background: var(--qc-gray-pale);
    border-color: var(--qc-gray);
  }

  .action-btn.primary {
    background: var(--qc-blue-piv);
    border-color: var(--qc-blue-piv);
    color: white;
  }

  .action-btn.primary:hover {
    background: var(--qc-blue);
    border-color: var(--qc-blue);
  }

  .tip {
    margin-top: 14px;
    font-size: 12px;
    color: var(--qc-gray);
    padding: 10px 12px;
    background: var(--qc-gray-pale);
    border-radius: 6px;
    line-height: 1.4;
  }
</style>
