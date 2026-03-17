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
      aria-pressed={$measureMode === 'distance'}
    >
      <span class="mode-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="8" x2="2" y2="16"/>
          <line x1="22" y1="8" x2="22" y2="16"/>
          <line x1="8" y1="10" x2="8" y2="14"/>
          <line x1="14" y1="10" x2="14" y2="14"/>
        </svg>
      </span>
      <span>Distance</span>
    </button>

    <button
      class="mode-btn"
      class:active={$measureMode === 'area'}
      on:click={() => setMode('area')}
      aria-pressed={$measureMode === 'area'}
    >
      <span class="mode-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="3" y="3" width="18" height="18" rx="1"/>
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke-dasharray="2 2" opacity="0.5"/>
        </svg>
      </span>
      <span>Superficie</span>
    </button>
  </div>

  {#if $measureMode}
    <div class="instruction" role="status" aria-live="polite">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {#if $measureMode === 'distance'}
        Cliquez pour tracer une ligne. Double-cliquez pour terminer.
      {:else}
        Cliquez pour tracer un polygone. Double-cliquez pour terminer.
      {/if}
    </div>
  {/if}

  <button class="clear-btn" on:click={clearMeasurements}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
    Effacer les mesures
  </button>
</div>

<style>
  .measure-panel {
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
    gap: 8px;
    padding: 16px 8px;
    background: var(--qc-gray-pale);
    border: 2px solid var(--qc-gray-light);
    border-radius: 8px;
    color: var(--qc-blue-dark);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 13px;
    font-family: inherit;
    font-weight: 600;
    min-height: 80px;
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

  .clear-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-top: 16px;
    padding: 11px;
    background: var(--qc-white);
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    color: var(--qc-gray-dark);
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    font-weight: 600;
    transition: all 0.15s;
    min-height: 44px;
  }

  .clear-btn:hover {
    background: var(--qc-red-pale);
    border-color: var(--qc-red);
    color: var(--qc-red);
  }
</style>
