import _ from 'lodash';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import config from '../_data/config.json';
import nycData from '../_data/map_nyc.json';
import wcData from '../_data/map_wc.json';

mapboxgl.accessToken = config.mapboxToken;

const NY_MARKER_COLOR = '#e7254d';
const NY_MARKER_STROKE_COLOR = '#c41639';
const WC_ROUTE_COLOR = '#ff6251';
const DEV_MODE = true;

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
          'circle-color': NY_MARKER_STROKE_COLOR,
          'circle-stroke-color': NY_MARKER_COLOR,
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
    const content = document.getElementById('map-wc-content');

    const MAP_ZOOM = 8;
    const ROUTE_COORDS = wcData.features[0].geometry.coordinates;

    function addMarker(point, map) {
      const element = document.createElement('div');
      element.className = `wc-marker${point.text ? '-text' : ''}`;
      element.textContent = point.text;

      const marker = new mapboxgl.Marker({
        element,
        offset: point.offset,
        rotation: point.rotation,
      })
        .setLngLat(ROUTE_COORDS[point.index])
        .addTo(map);

      point.drawed = true;

      return marker;
    }

    const screenRouteParts = [
      {
        id: 'la',
        point: true,
        index: 0,
        text: 'Los Angeles',
        offset: [0, -50],
        rotation: -7,
      },
      {
        id: 'start',
        point: true,
        index: 0, // a bullet at start of the route
      },
      {
        id: 'LAtoMonterey',
        index: [0, 6422],
      },
    ].map((p) => {
      p.element = document.getElementById(p.id);

      if (!p.point) {
        const { offsetHeight: elementHeight } = p.element;
        const pointsCount = p.index[1] - p.index[0] + 1;

        p.pixelsInRoutePoint = elementHeight / pointsCount;
      }

      return p;
    });

    const routePoints = [
      {
        index: 2865,
        text: 'Morro Bay',
        offset: [120, -50],
        rotation: -7,
      },
      {
        index: 4634,
        text: 'Big Sur',
        offset: [40, -40],
        rotation: 50,
      },
      {
        index: 6422,
        text: 'Monterey',
        offset: [125, -25],
        rotation: -7,
      },
      {
        index: 6422, // a bullet at the end of the route
      },
    ];

    const map = new mapboxgl.Map({
      container: $mapWestCoast.get(0),
      style: 'mapbox://styles/ivkrpv/ckhhbvbax0qz319o1otmb3kg0',
      center: DEV_MODE ? ROUTE_COORDS[0] : [37.6173, 55.7558],
      zoom: MAP_ZOOM,
      attributionControl: false,
      interactive: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      const routeGeojson = {
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

      map.addSource('route', {
        type: 'geojson',
        data: routeGeojson,
      });

      map.addLayer({
        id: 'route-animated',
        type: 'line',
        source: 'route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': WC_ROUTE_COLOR,
          'line-width': 6,
          'line-opacity': 1,
        },
      });

      // a flight from Moscow to LA at start
      if (!DEV_MODE) {
        map.flyTo({
          center: ROUTE_COORDS[0],
          minZoom: 2,
          essential: true,
          speed: 0.2,
        });
      }

      let lastDrawedIndex = 0;

      const routeAnimateOptions = {
        duration: 2000,
        essential: true,
      };

      content.onscroll = _.throttle(() => {
        screenRouteParts.forEach((part) => {
          const { offsetHeight: contentHeight, scrollTop } = content;
          const scrollBottom = scrollTop + contentHeight;
          const { offsetTop: elementTop } = part.element;

          // it's visible
          if (elementTop < scrollBottom) {
            if (part.point) {
              if (!part.drawed) {
                addMarker(part, map);
              }

              return;
            }

            const visibleRoutePointsCount = Math.floor(
              (scrollBottom - elementTop) / part.pixelsInRoutePoint
            );
            const lastVisibleIndex = visibleRoutePointsCount - 1;

            if (lastVisibleIndex > lastDrawedIndex) {
              if (part.drawed) return;

              const routeSliceToDraw = ROUTE_COORDS.slice(lastDrawedIndex, visibleRoutePointsCount);

              Array.prototype.push.apply(
                routeGeojson.features[0].geometry.coordinates,
                routeSliceToDraw
              );

              map.getSource('route').setData(routeGeojson);

              const endOfTheRoute = _.last(routeSliceToDraw);

              map.setZoom(MAP_ZOOM);
              map.panTo(endOfTheRoute, routeAnimateOptions);

              routePoints.forEach((point) => {
                if (point.drawed || point.index > lastVisibleIndex) return;

                addMarker(point, map);
              });

              // DEBUG: show current cursor position
              if (DEV_MODE) {
                console.log(
                  `Coords: ${endOfTheRoute}, index: ${_.findIndex(
                    ROUTE_COORDS,
                    ([x, y]) => x === endOfTheRoute[0] && y === endOfTheRoute[1]
                  )}`
                );
              }

              lastDrawedIndex = lastVisibleIndex;

              if (lastDrawedIndex >= part.index[1]) {
                part.drawed = true;
              }
            } else {
              map.panTo(ROUTE_COORDS[lastVisibleIndex], routeAnimateOptions);
            }
          }
        });
      }, 10);
    });
  }
};
