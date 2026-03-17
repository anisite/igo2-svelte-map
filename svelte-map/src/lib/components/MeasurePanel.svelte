<script>
  import { measureMode, notify } from '../stores/map.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function setMode(mode) {
    measureMode.update((v) => (v === mode ? null : mode));
  }

  function clearMeasurements() {
    dispatch('clear');
    notify('Mesures effacées', 'info');
  }
</script>

<div class="measure-panel">
  <h3>Outils de mesure</h3>

  <div class="modes">
    <button
      class="mode-btn"
      class:active={$measureMode === 'distance'}
      on:click={() => setMode('distance')}
    >
      <span class="mode-icon">📏</span>
      <span>Distance</span>
    </button>

    <button
      class="mode-btn"
      class:active={$measureMode === 'area'}
      on:click={() => setMode('area')}
    >
      <span class="mode-icon">⬛</span>
      <span>Superficie</span>
    </button>
  </div>

  {#if $measureMode}
    <div class="instruction">
      {#if $measureMode === 'distance'}
        Cliquez pour tracer une ligne. Double-cliquez pour terminer.
      {:else}
        Cliquez pour tracer un polygone. Double-cliquez pour terminer.
      {/if}
    </div>
  {/if}

  <button class="clear-btn" on:click={clearMeasurements}>Effacer les mesures</button>
</div>

<style>
  .measure-panel {
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
    padding: 16px 8px;
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
    border-color: rgba(52, 152, 219, 0.3);
  }

  .mode-btn.active {
    background: rgba(52, 152, 219, 0.15);
    border-color: #2980b9;
    color: #3498db;
  }

  .mode-icon {
    font-size: 28px;
  }

  .instruction {
    margin-top: 12px;
    padding: 10px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 6px;
    font-size: 12px;
    color: #5dade2;
    text-align: center;
  }

  .clear-btn {
    width: 100%;
    margin-top: 16px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid #444;
    border-radius: 6px;
    color: #ccc;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
  }

  .clear-btn:hover {
    background: rgba(231, 76, 60, 0.15);
    border-color: rgba(231, 76, 60, 0.4);
    color: #e74c3c;
  }
</style>
