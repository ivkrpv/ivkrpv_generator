import _ from 'lodash';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import config from '../_data/config.json';
import nycData from '../_data/map_nyc.json';
import wcData from '../_data/map_wc.json';

mapboxgl.accessToken = config.mapboxToken;

function shiftMapCoords(map, contentWidth, lngLat) {
  const centerPoint = map.project(lngLat);
  centerPoint.x += contentWidth / 2;

  return map.unproject(centerPoint);
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

    const ROUTE_COORDS = wcData.features[0].geometry.coordinates;
    // How to find a place in the route
    // ROUTE_COORDS.map(([x, y], i) => ({ x, y, i })).filter(({ x, y }) => x === -121.88548 && y === 36.58442)

    const route = [
      {
        id: 'la',
        point: true,
        pointIndex: 0,
      },
      {
        id: 'firstRoadSCali',
        point: false,
        routeIndex: [0, 6220],
      },
      {
        id: 'monterey',
        point: true,
        pointIndex: 6220,
      },
    ].map((p) => {
      p.element = document.getElementById(p.id);

      if (!p.point) {
        const { offsetTop, offsetHeight } = p.element;
      }

      return p;
    });

    const map = new mapboxgl.Map({
      container: $mapWestCoast.get(0),
      style: 'mapbox://styles/ivkrpv/ck9qq2b8l0hxb1irw9z8wq0ao',
      center: [1.845552, 69.65314], // somewhere in the arctic ocean
      zoom: 9,
      attributionControl: false,
      interactive: false,
    });

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      ],
    };

    map.on('load', () => {
      map.addSource('line', {
        type: 'geojson',
        data: geojson,
      });

      // add the line which will be modified in the animation
      map.addLayer({
        id: 'line-animation',
        type: 'line',
        source: 'line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#ed6498',
          'line-width': 5,
          'line-opacity': 0.8,
        },
      });

      // first load, show LA
      map.flyTo({
        center: shiftMapCoords(map, contentBounds.width, ROUTE_COORDS[route[0].pointIndex]),
        minZoom: 2,
        pitch: 45,
      });

      content.onscroll = _.throttle((e) => {
        for (let i = 0; i < route.length; i++) {
          const part = route[i];

          if (part.drawed) continue;

          const { offsetHeight: contentHeight, scrollTop } = content;
          const scrollBottom = scrollTop + contentHeight;
          const { offsetTop: elementTop } = part.element;

          if (elementTop < scrollBottom) {
            if (part.point) {
              const marker = new mapboxgl.Marker({ color: '#94b377' })
                .setLngLat(ROUTE_COORDS[part.pointIndex])
                .addTo(map);

              part.drawed = true;
            } else {
              part.lastDrawedIndex = part.lastDrawedIndex ?? part.routeIndex[0];
              const { offsetHeight: elementHeight } = part.element;

              const pointsCount = part.routeIndex[1] - part.routeIndex[0] + 1;
              const pixelsInOnePoint = elementHeight / pointsCount;
              const visiblePointsCount = (scrollBottom - elementTop) / pixelsInOnePoint;

              const routeSliceToDraw = ROUTE_COORDS.slice(part.lastDrawedIndex, visiblePointsCount);

              // append new coordinates to the lineString
              Array.prototype.push.apply(
                geojson.features[0].geometry.coordinates,
                routeSliceToDraw
              );

              // then update the map
              map.getSource('line').setData(geojson);

              const routeEnd = shiftMapCoords(map, contentBounds.width, _.last(routeSliceToDraw));
              map.panTo(routeEnd, { essential: true });

              part.lastDrawedIndex = visiblePointsCount - 1;

              if (part.lastDrawedIndex >= part.routeIndex[1]) {
                part.drawed = true;
              }
            }

            break;
          }
        }
      }, 16);
    });

    map.addControl(new mapboxgl.AttributionControl(), 'top-right');
  }
};
