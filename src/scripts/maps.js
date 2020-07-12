import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import config from '../_data/config.json';
import nycData from '../_data/map_nyc.json';

mapboxgl.accessToken = config.mapboxToken;

function shiftMapCoords(map, contentWidth, lngLat) {
  const centerPoint = map.project(lngLat);
  centerPoint.x += contentWidth / 2;

  return map.unproject(centerPoint);
}

function isElementVisible(id, { top, bottom }) {
  const element = document.getElementById(id);
  const bounds = element.getBoundingClientRect();

  // console.log(bounds.top > top && bounds.bottom < bottom);

  return bounds.top > top && bounds.bottom < bottom;
}

export default () => {
  // NYC map
  const $mapNYC = $('.map-nyc');

  if ($mapNYC.length) {
    const map = new mapboxgl.Map({
      container: $mapNYC.get(0),
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-74.006, 40.7128], // default nyc center
      zoom: 2,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl(), 'top-right');

    map.on('load', function () {
      const ZOOM_DURATION = 5000;

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
            delay: ZOOM_DURATION / 2,
          },
          'circle-color': '#c41639',
          'circle-stroke-color': '#e7254d',
          'circle-stroke-width': 0,
          'circle-stroke-width-transition': {
            duration: 1000,
            delay: ZOOM_DURATION / 2,
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
          duration: ZOOM_DURATION,
        });
      }, 500);
    });
  }

  // West Coast map
  const $mapWestCoast = $('.map-west-coast');

  if ($mapWestCoast.length) {
    const content = document.getElementById('map-overflow-content');
    const contentBounds = content.getBoundingClientRect();

    let activeChapterName = 'la';
    const routeChapters = {
      la: {
        center: [-118.2437, 34.0522],
      },
    };

    const drawed = {};

    const map = new mapboxgl.Map({
      container: $mapWestCoast.get(0),
      style: 'mapbox://styles/ivkrpv/ck9qq2b8l0hxb1irw9z8wq0ao',
      center: [1.845552, 69.65314], // somewhere in the arctic ocean
      zoom: 9,
      attributionControl: false,
      interactive: false,
    });

    map.on('load', () => {
      // first load, show LA
      map.flyTo({
        center: shiftMapCoords(map, contentBounds.width, routeChapters.la.center),
        minZoom: 2,
        pitch: 15,
      });

      content.onscroll = function () {
        for (const chapterName in routeChapters) {
          if (isElementVisible(chapterName, contentBounds) && !drawed[chapterName]) {
            const marker = new mapboxgl.Marker({ color: '#94b377' })
              .setLngLat(routeChapters[chapterName].center)
              .addTo(map);

            drawed[chapterName] = true;

            break;
          }
        }
      };
    });

    map.addControl(new mapboxgl.AttributionControl(), 'top-right');
  }
};
