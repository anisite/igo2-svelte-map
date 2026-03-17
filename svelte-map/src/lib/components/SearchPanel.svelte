<script>
  import { searchResults, searchQuery, notify } from '../stores/map.js';
  import { searchAddress, parseCoordinates } from '../utils/geocoder.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let loading = false;
  let debounceTimer;

  async function doSearch() {
    const q = $searchQuery.trim();
    if (!q) {
      searchResults.set([]);
      return;
    }

    // Try coordinate parsing first
    const coords = parseCoordinates(q);
    if (coords) {
      searchResults.set([
        { id: 'coord', name: `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`, lon: coords.lon, lat: coords.lat }
      ]);
      return;
    }

    loading = true;
    try {
      const results = await searchAddress(q);
      searchResults.set(results);
      if (results.length === 0) notify('Aucun résultat trouvé', 'info');
    } catch {
      notify('Erreur lors de la recherche', 'error');
    } finally {
      loading = false;
    }
  }

  function onInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 400);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      doSearch();
    }
  }

  function selectResult(result) {
    dispatch('select', result);
  }

  function clearSearch() {
    searchQuery.set('');
    searchResults.set([]);
  }
</script>

<div class="search-panel">
  <h3>Recherche d'adresse</h3>

  <div class="search-input-wrap">
    <input
      type="text"
      placeholder="Adresse, lieu ou coordonnées..."
      bind:value={$searchQuery}
      on:input={onInput}
      on:keydown={onKeyDown}
    />
    {#if $searchQuery}
      <button class="clear-btn" on:click={clearSearch}>✕</button>
    {/if}
  </div>

  {#if loading}
    <div class="loading">Recherche en cours...</div>
  {/if}

  <div class="results">
    {#each $searchResults as result}
      <button class="result-item" on:click={() => selectResult(result)}>
        <span class="result-name">{result.name}</span>
        <span class="result-coords">{result.lat.toFixed(4)}, {result.lon.toFixed(4)}</span>
      </button>
    {/each}
  </div>

  <div class="hint">
    <p>Formats acceptés :</p>
    <ul>
      <li>Adresse : "Québec, Canada"</li>
      <li>Coordonnées : "48.4469, -71.9380"</li>
      <li>DMS : 48°26'49"N 71°56'17"O</li>
    </ul>
  </div>
</div>

<style>
  .search-panel {
    padding: 12px;
  }

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    color: #e0e0ff;
  }

  .search-input-wrap {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    padding: 10px 32px 10px 12px;
    border: 1px solid #333;
    border-radius: 6px;
    background: #1a1a2e;
    color: #e0e0ff;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
  }

  input:focus {
    border-color: #00a1de;
  }

  .clear-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 14px;
    padding: 4px 8px;
  }

  .loading {
    padding: 8px;
    color: #00a1de;
    font-size: 12px;
    text-align: center;
  }

  .results {
    margin-top: 8px;
    max-height: 300px;
    overflow-y: auto;
  }

  .result-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 8px 10px;
    border: none;
    background: transparent;
    color: #ccc;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;
  }

  .result-item:hover {
    background: rgba(0, 161, 222, 0.15);
  }

  .result-name {
    display: block;
    font-size: 12px;
    line-height: 1.3;
  }

  .result-coords {
    display: block;
    font-size: 10px;
    color: #888;
    margin-top: 2px;
  }

  .hint {
    margin-top: 16px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 11px;
    color: #888;
  }

  .hint p {
    margin: 0 0 4px;
  }

  .hint ul {
    margin: 0;
    padding-left: 16px;
  }

  .hint li {
    margin: 2px 0;
  }
</style>
