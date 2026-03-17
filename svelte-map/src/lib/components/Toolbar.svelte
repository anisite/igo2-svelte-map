<script>
  import { activeTool } from '../stores/map.js';

  const tools = [
    { id: 'search', label: 'Recherche', svgPath: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>' },
    { id: 'layers', label: 'Couches',   svgPath: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' },
    { id: 'draw',   label: 'Dessin',    svgPath: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>' },
    { id: 'measure',label: 'Mesure',    svgPath: '<path d="M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4"/>' },
    { id: 'import', label: 'Import',    svgPath: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' },
    { id: 'print',  label: 'Impression',svgPath: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>' }
  ];

  function toggle(id) {
    activeTool.update((v) => (v === id ? null : id));
  }
</script>

<div class="toolbar" role="navigation" aria-label="Outils de la carte">
  {#each tools as tool}
    <button
      class="tool-btn"
      class:active={$activeTool === tool.id}
      on:click={() => toggle(tool.id)}
      title={tool.label}
      aria-label={tool.label}
      aria-pressed={$activeTool === tool.id}
    >
      <span class="icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          {@html tool.svgPath}
        </svg>
      </span>
      <span class="label">{tool.label}</span>
    </button>
  {/each}
</div>

<style>
  .toolbar {
    display: flex;
    flex-direction: column;
    background: var(--qc-gray-pale);
    border-right: 1px solid var(--qc-gray-light);
    padding: 6px 4px;
    gap: 2px;
    width: 68px;
    flex-shrink: 0;
    overflow-y: auto;
  }

  .tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 10px 4px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--qc-gray-dark);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.15s;
    font-size: 10px;
    font-family: inherit;
    min-height: 56px;
    width: 100%;
  }

  .tool-btn:hover {
    background: var(--qc-blue-light);
    color: var(--qc-blue);
    border-color: var(--qc-blue-clear);
  }

  .tool-btn.active {
    background: var(--qc-blue-piv);
    color: white;
    border-color: var(--qc-blue-piv);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .label {
    font-size: 9px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  /* ── Mobile : barre horizontale ──────────────────────────────────────── */
  @media (max-width: 768px) {
    .toolbar {
      flex-direction: row;
      width: 100%;
      height: 60px;
      padding: 6px;
      gap: 4px;
      border-right: none;
      border-bottom: 1px solid var(--qc-gray-light);
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }

    .tool-btn {
      flex-direction: row;
      flex-shrink: 0;
      width: auto;
      min-width: 80px;
      height: 44px;
      min-height: 44px;
      padding: 0 12px;
      gap: 8px;
      border-radius: 6px;
      scroll-snap-align: start;
    }

    .label {
      font-size: 12px;
      white-space: nowrap;
    }
  }
</style>
