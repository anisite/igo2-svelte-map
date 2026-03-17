<script>
  import { onMount, onDestroy } from 'svelte';
  import Map from 'ol/Map';
  import View from 'ol/View';
  import TileLayer from 'ol/layer/Tile';
  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import OSM from 'ol/source/OSM';
  import XYZ from 'ol/source/XYZ';
  import { fromLonLat, toLonLat } from 'ol/proj';
  import { defaults as defaultControls } from 'ol/control';
  import ScaleLine from 'ol/control/ScaleLine';
  import Attribution from 'ol/control/Attribution';
  import Feature from 'ol/Feature';
  import Point from 'ol/geom/Point';
  import { Style, Fill, Stroke, Circle as CircleStyle, Icon } from 'ol/style';
  import Draw from 'ol/interaction/Draw';
  import Modify from 'ol/interaction/Modify';
  import Snap from 'ol/interaction/Snap';
  import Overlay from 'ol/Overlay';
  import { getArea, getLength } from 'ol/sphere';
  import { unByKey } from 'ol/Observable';
  import GeoJSON from 'ol/format/GeoJSON';
  import TileWMS from 'ol/source/TileWMS';
  import {
    activeBaseLayer,
    overlayLayers,
    drawingMode,
    measureMode,
    searchResults,
    mapView,
    notify
  } from '../stores/map.js';
  import { reverseGeocode } from '../utils/geocoder.js';

  let mapContainer;
  let map;
  let tooltipEl;
  let measureTooltip;

  // Layers
  const baseLayers = {};
  let searchLayer;
  let drawLayer;
  let measureLayer;
  let importedLayers = [];

  // Interactions
  let drawInteraction;
  let measureInteraction;
  let modifyInteraction;
  let snapInteraction;

  // Export map for external use
  export function getMap() { return map; }
  export function getMapElement() { return mapContainer; }
  export function getDrawSource() { return drawLayer?.getSource(); }
  export function getMeasureSource() { return measureLayer?.getSource(); }
  export function getSearchLayer() { return searchLayer; }

  const baseLayerDefs = {
    osm: { name: 'OpenStreetMap', create: () => new TileLayer({ source: new OSM() }) },
    osmHot: {
      name: 'OSM Humanitaire',
      create: () => new TileLayer({
        source: new XYZ({
          url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          attributions: '© OpenStreetMap contributors, HOT'
        })
      })
    },
    cartoLight: {
      name: 'Carto Light',
      create: () => new TileLayer({
        source: new XYZ({
          url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          attributions: '© CARTO'
        })
      })
    },
    cartoDark: {
      name: 'Carto Dark',
      create: () => new TileLayer({
        source: new XYZ({
          url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          attributions: '© CARTO'
        })
      })
    },
    none: {
      name: 'Aucun fond',
      create: () => new TileLayer({ source: null, visible: true })
    }
  };

  // Search result style
  const searchStyle = new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: 'rgba(94, 208, 251, 0.8)' }),
      stroke: new Stroke({ color: '#00a1de', width: 2 })
    }),
    fill: new Fill({ color: 'rgba(94, 208, 251, 0.3)' }),
    stroke: new Stroke({ color: '#00a1de', width: 2 })
  });

  // Draw style
  const drawStyle = new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: 'rgba(255, 100, 50, 0.8)' }),
      stroke: new Stroke({ color: '#ff4500', width: 2 })
    }),
    fill: new Fill({ color: 'rgba(255, 100, 50, 0.2)' }),
    stroke: new Stroke({ color: '#ff4500', width: 2 })
  });

  // Measure style
  const measureStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: 'rgba(52, 152, 219, 0.8)' }),
      stroke: new Stroke({ color: '#2980b9', width: 2 })
    }),
    fill: new Fill({ color: 'rgba(52, 152, 219, 0.2)' }),
    stroke: new Stroke({
      color: '#2980b9',
      width: 2,
      lineDash: [10, 10]
    })
  });

  onMount(() => {
    // Create base layers
    for (const [id, def] of Object.entries(baseLayerDefs)) {
      baseLayers[id] = def.create();
      baseLayers[id].set('id', id);
      baseLayers[id].setVisible(id === 'osm');
    }

    // Search results layer
    searchLayer = new VectorLayer({
      source: new VectorSource(),
      style: searchStyle,
      zIndex: 100
    });

    // Drawing layer
    drawLayer = new VectorLayer({
      source: new VectorSource(),
      style: drawStyle,
      zIndex: 200
    });

    // Measure layer
    measureLayer = new VectorLayer({
      source: new VectorSource(),
      style: measureStyle,
      zIndex: 150
    });

    // Tooltip for measurements
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'measure-tooltip';

    // Create map
    map = new Map({
      target: mapContainer,
      layers: [
        ...Object.values(baseLayers),
        searchLayer,
        measureLayer,
        drawLayer
      ],
      view: new View({
        center: fromLonLat([-71.938087, 48.446975]),
        zoom: 6,
        maxZoom: 19
      }),
      controls: defaultControls({ attribution: false }).extend([
        new ScaleLine({ units: 'metric' }),
        new Attribution({ collapsible: true, collapsed: true })
      ])
    });

    measureTooltip = new Overlay({
      element: tooltipEl,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false
    });
    map.addOverlay(measureTooltip);

    // Right-click reverse geocode
    map.on('contextmenu', async (e) => {
      e.preventDefault();
      const coords = toLonLat(e.coordinate);
      const result = await reverseGeocode(coords[0], coords[1]);
      if (result) {
        notify(`${result.name}`, 'info', 5000);
      } else {
        notify(`${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`, 'info', 3000);
      }
    });

    // Prevent default context menu
    mapContainer.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  onDestroy(() => {
    if (map) map.setTarget(null);
  });

  // React to base layer changes
  $: if (map && $activeBaseLayer) {
    for (const [id, layer] of Object.entries(baseLayers)) {
      layer.setVisible(id === $activeBaseLayer);
    }
  }

  // React to drawing mode changes
  $: if (map) {
    // Remove existing draw interaction
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
      drawInteraction = null;
    }
    if (modifyInteraction) {
      map.removeInteraction(modifyInteraction);
      modifyInteraction = null;
    }
    if (snapInteraction) {
      map.removeInteraction(snapInteraction);
      snapInteraction = null;
    }

    if ($drawingMode) {
      const source = drawLayer.getSource();
      drawInteraction = new Draw({
        source,
        type: $drawingMode,
        style: drawStyle
      });
      modifyInteraction = new Modify({ source });
      snapInteraction = new Snap({ source });

      map.addInteraction(drawInteraction);
      map.addInteraction(modifyInteraction);
      map.addInteraction(snapInteraction);
    }
  }

  // React to measure mode changes
  $: if (map) {
    if (measureInteraction) {
      map.removeInteraction(measureInteraction);
      measureInteraction = null;
    }

    if ($measureMode) {
      const type = $measureMode === 'area' ? 'Polygon' : 'LineString';
      const source = measureLayer.getSource();

      measureInteraction = new Draw({
        source,
        type,
        style: measureStyle
      });

      let listener;
      measureInteraction.on('drawstart', (evt) => {
        listener = evt.feature.getGeometry().on('change', (e) => {
          const geom = e.target;
          let output;
          if ($measureMode === 'area') {
            const area = getArea(geom);
            output = area > 10000
              ? `${(area / 1000000).toFixed(2)} km²`
              : `${area.toFixed(0)} m²`;
          } else {
            const length = getLength(geom);
            output = length > 1000
              ? `${(length / 1000).toFixed(2)} km`
              : `${length.toFixed(0)} m`;
          }
          tooltipEl.textContent = output;
          measureTooltip.setPosition(geom.getLastCoordinate());
        });
      });

      measureInteraction.on('drawend', () => {
        tooltipEl.className = 'measure-tooltip measure-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        // Create new tooltip for next measurement
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'measure-tooltip';
        measureTooltip = new Overlay({
          element: tooltipEl,
          offset: [0, -15],
          positioning: 'bottom-center',
          stopEvent: false
        });
        map.addOverlay(measureTooltip);
        if (listener) unByKey(listener);
      });

      map.addInteraction(measureInteraction);
    }
  }

  // React to overlay layers changes
  $: if (map && $overlayLayers) {
    // Remove old imported layers
    importedLayers.forEach((l) => map.removeLayer(l));
    importedLayers = [];

    // Add current overlay layers
    $overlayLayers.forEach((layerDef) => {
      if (layerDef.olLayer) {
        layerDef.olLayer.setVisible(layerDef.visible);
        layerDef.olLayer.setOpacity(layerDef.opacity);
        map.addLayer(layerDef.olLayer);
        importedLayers.push(layerDef.olLayer);
      }
    });
  }

  // React to search results
  $: if (searchLayer && $searchResults) {
    const source = searchLayer.getSource();
    source.clear();
    $searchResults.forEach((r) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([r.lon, r.lat])),
        name: r.name
      });
      source.addFeature(feature);
    });
  }

  export function zoomToExtent(extent) {
    if (map) {
      map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 17, duration: 500 });
    }
  }

  export function zoomToCoord(lon, lat, zoom = 15) {
    if (map) {
      map.getView().animate({ center: fromLonLat([lon, lat]), zoom, duration: 500 });
    }
  }

  export function geolocate() {
    if (!navigator.geolocation) {
      notify('La géolocalisation n\'est pas supportée', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        zoomToCoord(pos.coords.longitude, pos.coords.latitude, 15);
        notify('Position trouvée', 'success');
      },
      () => notify('Impossible d\'obtenir la position', 'error'),
      { enableHighAccuracy: true }
    );
  }
</script>

<div class="map-container" bind:this={mapContainer}></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  :global(.measure-tooltip) {
    position: relative;
    background: rgba(0, 0, 0, 0.75);
    border-radius: 4px;
    color: white;
    padding: 4px 8px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
  }

  :global(.measure-tooltip-static) {
    background: rgba(41, 128, 185, 0.9);
    font-weight: bold;
  }
</style>
