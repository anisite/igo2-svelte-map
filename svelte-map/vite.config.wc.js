/**
 * vite.config.wc.js — Build du web component <igo2-map>
 *
 * Produit dans dist-wc/ :
 *   igo2-map.iife.js   — bundle autonome (IIFE, tout inclus)
 *   igo2-map.css       — styles extraits (OL + composants)
 *
 * Lancer : npm run build:wc
 */
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    svelte({
      // Ne pas utiliser le plugin SvelteKit ici — build standalone
    })
  ],

  resolve: {
    alias: {
      // Reproduire l'alias $lib de SvelteKit
      '$lib': path.resolve(__dirname, 'src/lib')
    }
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/webcomponent/index.js'),
      name: 'IGO2Map',
      fileName: 'igo2-map',
      formats: ['iife']   // Format IIFE = fonctionne avec un simple <script src="...">
    },
    outDir: 'dist-wc',
    emptyOutDir: true,
    cssCodeSplit: false,  // Un seul fichier CSS

    rollupOptions: {
      output: {
        // Assurer que les imports dynamiques soient inline dans l'IIFE
        inlineDynamicImports: true
      }
    }
  }
});
