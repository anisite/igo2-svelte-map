<script>
  import { activeTool } from '../stores/map.js';

  const tools = [
    { id: 'search', icon: '🔍', label: 'Recherche' },
    { id: 'layers', icon: '🗂', label: 'Couches' },
    { id: 'draw', icon: '✏️', label: 'Dessin' },
    { id: 'measure', icon: '📏', label: 'Mesure' },
    { id: 'import', icon: '📥', label: 'Import/Export' },
    { id: 'print', icon: '🖨', label: 'Impression' }
  ];

  function toggle(id) {
    activeTool.update((v) => (v === id ? null : id));
  }
</script>

<div class="toolbar">
  {#each tools as tool}
    <button
      class="tool-btn"
      class:active={$activeTool === tool.id}
      on:click={() => toggle(tool.id)}
      title={tool.label}
    >
      <span class="icon">{tool.icon}</span>
      <span class="label">{tool.label}</span>
    </button>
  {/each}
</div>

<style>
  .toolbar {
    display: flex;
    flex-direction: column;
    background: #1a1a2e;
    padding: 8px 4px;
    gap: 2px;
    width: 64px;
    flex-shrink: 0;
  }

  .tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    border: none;
    background: transparent;
    color: #a0a0c0;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.15s;
    font-size: 10px;
  }

  .tool-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0ff;
  }

  .tool-btn.active {
    background: #00a1de;
    color: white;
  }

  .icon {
    font-size: 20px;
    line-height: 1;
  }

  .label {
    font-size: 9px;
    white-space: nowrap;
  }
</style>
