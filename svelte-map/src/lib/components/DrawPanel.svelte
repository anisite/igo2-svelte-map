<script>
  import { drawingMode, notify } from '../stores/map.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const modes = [
    { id: 'Point', icon: '📍', label: 'Point' },
    { id: 'LineString', icon: '📐', label: 'Ligne' },
    { id: 'Polygon', icon: '⬡', label: 'Polygone' },
    { id: 'Circle', icon: '⭕', label: 'Cercle' }
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
      >
        <span class="mode-icon">{mode.icon}</span>
        <span>{mode.label}</span>
      </button>
    {/each}
  </div>

  {#if $drawingMode}
    <div class="instruction">
      Cliquez sur la carte pour dessiner.
      {#if $drawingMode === 'Polygon' || $drawingMode === 'LineString'}
        Double-cliquez pour terminer.
      {/if}
    </div>
  {/if}

  <div class="actions">
    <button class="action-btn" on:click={clearDrawings}>Effacer tout</button>
    <button class="action-btn export" on:click={exportDrawings}>Exporter GeoJSON</button>
  </div>

  <div class="tip">
    Les dessins peuvent être modifiés en cliquant-glissant les sommets après création.
  </div>
</div>

<style>
  .draw-panel {
    padding: 12px;
  }

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    color: #e0e0ff;
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
    gap: 4px;
    padding: 12px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-radius: 8px;
    color: #ccc;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 12px;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 100, 50, 0.3);
  }

  .mode-btn.active {
    background: rgba(255, 100, 50, 0.15);
    border-color: #ff4500;
    color: #ff6432;
  }

  .mode-icon {
    font-size: 24px;
  }

  .instruction {
    margin-top: 12px;
    padding: 10px;
    background: rgba(255, 100, 50, 0.1);
    border-radius: 6px;
    font-size: 12px;
    color: #ff8c64;
    text-align: center;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .action-btn {
    flex: 1;
    padding: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid #444;
    border-radius: 6px;
    color: #ccc;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.15s;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .action-btn.export {
    background: rgba(0, 161, 222, 0.1);
    border-color: rgba(0, 161, 222, 0.3);
    color: #00a1de;
  }

  .action-btn.export:hover {
    background: rgba(0, 161, 222, 0.2);
  }

  .tip {
    margin-top: 12px;
    font-size: 11px;
    color: #666;
    padding: 8px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
  }
</style>
