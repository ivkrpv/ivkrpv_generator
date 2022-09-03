import _ from 'lodash';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import config from '../_data/config.json';
import nycData from '../_data/map_nyc.json';
import { documentReady } from './utils';

mapboxgl.accessToken = config.mapboxToken;

documentReady(function () {
  initNYCMap();
});

function initNYCMap() {
  const MAP_STYLE = 'mapbox://styles/mapbox/dark-v10';
  const MAP_CENTER = [-74.006, 40.7128];
  const MAP_ZOOM = 2;
  const MAP_ZOOM_DURATION = 5000;
  const MARKER_COLOR = '#e7254d';
  const MARKER_STROKE = '#c41639';

  const mapEl = document.getElementById('nyc-map-container');

  if (!mapEl) return;

  const map = new mapboxgl.Map({
    container: mapEl,
    style: MAP_STYLE,
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    attributionControl: false,
  });

  map.addControl(new mapboxgl.AttributionControl(), 'top-right');

  map.on('load', function () {
    map.addSource('nyc', {
      type: 'geojson',
      data: nycData,
    });

    map.addLayer({
      id: 'spots',
      type: 'circle',
      source: 'nyc',
      paint: {
        'circle-radius': 0,
        'circle-radius-transition': {
          duration: 1000,
          delay: MAP_ZOOM_DURATION / 2,
        },
        'circle-color': MARKER_STROKE,
        'circle-stroke-color': MARKER_COLOR,
        'circle-stroke-width': 0,
        'circle-stroke-width-transition': {
          duration: 1000,
          delay: MAP_ZOOM_DURATION / 2,
        },
      },
      filter: ['==', '$type', 'Point'],
    });

    map.setPaintProperty('spots', 'circle-radius', 2);
    map.setPaintProperty('spots', 'circle-stroke-width', 4);

    map.on('click', 'spots', function ({ features: [feature], lngLat: { lng } }) {
      const coordinates = feature.geometry.coordinates.slice();
      const { name, images } = feature.properties;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(lng - coordinates[0]) > 180) {
        coordinates[0] += lng > coordinates[0] ? 360 : -360;
      }

      let html = `<h6 class="mr-3 font-weight-bold">${name}</h6>`;

      if (images) {
        const urls = JSON.parse(images);

        if (urls && urls.length) {
          const buttons = `<div class="d-flex justify-content-between mt-1">
            <i class="fas fa-arrow-left popup-gallery-prev"></i><i class="fas fa-arrow-right popup-gallery-next"></i>
            </div>`;

          html += `<div class="popup-gallery">
            <div class="d-flex justify-content-center popup-gallery-images">${urls
              .map((u) => `<img src="${u}" />`)
              .join('')}</div>
            ${urls.length > 1 ? buttons : ''}
            </div>`;
        }
      }

      new mapboxgl.Popup({ offset: 6 }).setLngLat(coordinates).setHTML(html).addTo(map);
    });

    map.on('mouseenter', 'spots', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'spots', function () {
      map.getCanvas().style.cursor = '';
    });

    setTimeout(() => {
      const bounds = new mapboxgl.LngLatBounds();

      nycData.features.forEach(function (feature) {
        bounds.extend(feature.geometry.coordinates);
      });

      map.fitBounds(bounds, {
        padding: 32,
        duration: MAP_ZOOM_DURATION,
      });
    }, 500);
  });
}
