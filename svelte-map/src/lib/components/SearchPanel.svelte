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
    <span class="search-icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    </span>
    <input
      type="search"
      placeholder="Adresse, lieu ou coordonnées..."
      bind:value={$searchQuery}
      on:input={onInput}
      on:keydown={onKeyDown}
      aria-label="Recherche d'adresse ou de coordonnées"
    />
    {#if $searchQuery}
      <button class="clear-btn" on:click={clearSearch} aria-label="Effacer la recherche">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    {/if}
  </div>

  {#if loading}
    <div class="loading" role="status" aria-live="polite">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      Recherche en cours…
    </div>
  {/if}

  {#if $searchResults.length > 0}
    <ul class="results" role="listbox" aria-label="Résultats de recherche">
      {#each $searchResults as result}
        <li role="option" aria-selected="false">
          <button class="result-item" on:click={() => selectResult(result)}>
            <span class="result-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span class="result-text">
              <span class="result-name">{result.name}</span>
              <span class="result-coords">{result.lat.toFixed(4)}, {result.lon.toFixed(4)}</span>
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="hint">
    <p class="hint-title">Formats acceptés</p>
    <ul>
      <li>Adresse: <code>Québec, Canada</code></li>
      <li>Coordonnées: <code>48.4469, -71.9380</code></li>
      <li>DMS: <code>48°26'49"N 71°56'17"O</code></li>
    </ul>
  </div>
</div>

<style>
  .search-panel {
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

  /* ── Champ de recherche ───────────────────────────────────────────────── */
  .search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    color: var(--qc-gray);
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 11px 40px 11px 36px;
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    background: var(--qc-white);
    color: var(--qc-blue-dark);
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    min-height: 44px;
  }

  input:focus {
    border-color: var(--qc-blue);
    box-shadow: 0 0 0 3px rgba(20, 114, 191, 0.2);
  }

  .clear-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--qc-gray);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    border-radius: 4px;
    min-width: 32px;
    min-height: 32px;
    justify-content: center;
  }

  .clear-btn:hover {
    color: var(--qc-blue-dark);
    background: var(--qc-gray-pale);
  }

  /* ── Chargement ───────────────────────────────────────────────────────── */
  .loading {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 4px;
    color: var(--qc-blue);
    font-size: 13px;
  }

  .loading-dot {
    width: 6px;
    height: 6px;
    background: var(--qc-blue);
    border-radius: 50%;
    animation: bounce 1.2s infinite ease-in-out;
  }

  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* ── Résultats ────────────────────────────────────────────────────────── */
  .results {
    margin-top: 8px;
    max-height: 260px;
    overflow-y: auto;
    list-style: none;
    border: 1px solid var(--qc-gray-light);
    border-radius: 6px;
    overflow: hidden;
  }

  .result-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    text-align: left;
    padding: 11px 12px;
    border: none;
    border-bottom: 1px solid var(--qc-gray-pale);
    background: var(--qc-white);
    color: var(--qc-blue-dark);
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
    min-height: 44px;
  }

  .result-item:hover {
    background: var(--qc-blue-light);
  }

  li:last-child .result-item {
    border-bottom: none;
  }

  .result-icon {
    color: var(--qc-blue);
    margin-top: 2px;
    flex-shrink: 0;
  }

  .result-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .result-name {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--qc-blue-dark);
  }

  .result-coords {
    font-size: 12px;
    color: var(--qc-gray);
  }

  /* ── Aide ─────────────────────────────────────────────────────────────── */
  .hint {
    margin-top: 16px;
    padding: 12px;
    background: var(--qc-blue-light);
    border-left: 3px solid var(--qc-blue);
    border-radius: 0 6px 6px 0;
    font-size: 13px;
    color: var(--qc-blue-medium);
  }

  .hint-title {
    font-weight: 700;
    margin-bottom: 6px;
    color: var(--qc-blue-dark);
  }

  .hint ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .hint li {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hint li::before {
    content: '–';
    color: var(--qc-blue);
  }

  code {
    background: rgba(20, 114, 191, 0.1);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    color: var(--qc-blue-medium);
  }
</style>
