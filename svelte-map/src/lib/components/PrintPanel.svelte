<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<div class="print-panel">
  <h3>Impression &amp; Export</h3>

  <button class="action-btn" on:click={() => dispatch('print')}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
    Imprimer la carte
  </button>

  <button class="action-btn primary" on:click={() => dispatch('exportpng')}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
    Exporter en PNG
  </button>

  <div class="sep"></div>

  <h3>Géolocalisation</h3>

  <button class="action-btn geo" on:click={() => dispatch('geolocate')}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
      <circle cx="12" cy="12" r="8" stroke-dasharray="2 2"/>
    </svg>
    Ma position
  </button>
</div>

<style>
  .print-panel {
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

  .action-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    font-weight: 600;
    margin-bottom: 8px;
    transition: all 0.15s;
    min-height: 44px;
    background: var(--qc-white);
    color: var(--qc-blue-dark);
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

  .action-btn.geo {
    background: var(--qc-green-pale);
    border-color: var(--qc-green);
    color: var(--qc-green);
  }

  .action-btn.geo:hover {
    background: #c4e8a4;
  }

  .sep {
    height: 1px;
    background: var(--qc-gray-light);
    margin: 8px 0 4px;
  }
</style>
