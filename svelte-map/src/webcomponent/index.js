import { mount, unmount } from 'svelte';
import IGO2MapApp from './IGO2MapApp.svelte';

/**
 * Custom Element <igo2-map>
 *
 * Usage dans n'importe quel site HTML :
 *   <link rel="stylesheet" href="igo2-map.css">
 *   <script src="igo2-map.iife.js"></script>
 *   <igo2-map style="width:100%;height:600px;display:block;"></igo2-map>
 */
class IGO2MapElement extends HTMLElement {
  #app = null;

  connectedCallback() {
    // Injecter la police Nunito Sans (design.quebec.ca) si absente
    if (!document.getElementById('igo2-nunito-font')) {
      const preconnect1 = Object.assign(document.createElement('link'), {
        rel: 'preconnect', href: 'https://fonts.googleapis.com'
      });
      const preconnect2 = Object.assign(document.createElement('link'), {
        rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'
      });
      const fontLink = Object.assign(document.createElement('link'), {
        id: 'igo2-nunito-font',
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap'
      });
      document.head.append(preconnect1, preconnect2, fontLink);
    }

    // S'assurer que l'élément hôte occupe de l'espace si aucun style défini
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.height)  this.style.height = '100%';

    this.#app = mount(IGO2MapApp, { target: this });
  }

  disconnectedCallback() {
    if (this.#app) {
      unmount(this.#app);
      this.#app = null;
    }
  }
}

if (!customElements.get('igo2-map')) {
  customElements.define('igo2-map', IGO2MapElement);
}
