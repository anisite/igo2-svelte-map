<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<div class="print-panel">
  <h3>Impression & Export</h3>

  <button class="print-btn" on:click={() => dispatch('print')}>
    Imprimer la carte
  </button>

  <button class="export-btn" on:click={() => dispatch('exportpng')}>
    Exporter en PNG
  </button>

  <div class="sep"></div>

  <h3>Géolocalisation</h3>
  <button class="geo-btn" on:click={() => dispatch('geolocate')}>
    Ma position
  </button>
</div>

<style>
  .print-panel {
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

  .print-btn,
  .export-btn,
  .geo-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    transition: all 0.15s;
  }

  .print-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0ff;
  }

  .print-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .export-btn {
    background: rgba(0, 161, 222, 0.1);
    color: #00a1de;
    border: 1px solid rgba(0, 161, 222, 0.3);
  }

  .export-btn:hover {
    background: rgba(0, 161, 222, 0.2);
  }

  .sep {
    height: 1px;
    background: #333;
    margin: 16px 0;
  }

  .geo-btn {
    background: rgba(46, 204, 113, 0.1);
    color: #2ecc71;
    border: 1px solid rgba(46, 204, 113, 0.3);
  }

  .geo-btn:hover {
    background: rgba(46, 204, 113, 0.2);
  }
</style>
