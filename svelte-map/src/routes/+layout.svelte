<script>
  import 'ol/ol.css';
</script>

<slot />

<style>
  /* ── Palette officielle design.quebec.ca ─────────────────────────────── */
  :global(:root) {
    --qc-blue-piv:    #095797;   /* en-têtes, institutionnel             */
    --qc-blue:        #1472BF;   /* boutons primaires, liens              */
    --qc-blue-clear:  #4A98D9;   /* hover / focus secondaire              */
    --qc-blue-light:  #DAE6F0;   /* fond hover, sélection                 */
    --qc-blue-dark:   #223654;   /* texte principal                       */
    --qc-blue-medium: #19406C;   /* texte secondaire                      */
    --qc-gray-pale:   #F1F1F2;   /* fond de page                          */
    --qc-gray-light:  #C5CAD2;   /* bordures                              */
    --qc-gray:        #8893A2;   /* texte discret                         */
    --qc-gray-dark:   #4E5662;   /* texte secondaire fort                 */
    --qc-white:       #FFFFFF;   /* fond panneaux                         */
    --qc-green:       #4F813D;   /* succès                                */
    --qc-green-pale:  #D7F0BB;   /* fond succès                           */
    --qc-red:         #CB381F;   /* erreur                                */
    --qc-red-pale:    #FFDBD6;   /* fond erreur                           */
    --qc-yellow:      #E0AD03;   /* avertissement                         */
    --qc-yellow-pale: #F8E69A;   /* fond avertissement                    */
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html, body) {
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 16px;
    background: var(--qc-gray-pale);
    color: var(--qc-blue-dark);
  }

  /* Focus visible accessible */
  :global(:focus-visible) {
    outline: 3px solid var(--qc-blue-clear);
    outline-offset: 2px;
  }
</style>
