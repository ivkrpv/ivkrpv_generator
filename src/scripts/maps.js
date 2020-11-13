import _ from 'lodash';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import config from '../_data/config.json';
import nycData from '../_data/map_nyc.json';
import wcData from '../_data/map_wc.json';

mapboxgl.accessToken = config.mapboxToken;

const BRAND_COLOR = '#e7254d';
const BRAND_DARK_COLOR = '#c41639';
const WC_COLOR = '#ff6251';

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
          'circle-color': BRAND_DARK_COLOR,
          'circle-stroke-color': BRAND_COLOR,
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

    // How to find a place in the route
    console.log(
      `Index of coords: ${_.findIndex(
        ROUTE_COORDS,
        ([x, y]) => x === -120.83914 && y === 35.36717
      )}`
    );

    function addMapMarker(routePart, map) {
      const element = document.createElement('div');
      element.className = `wc-marker${routePart.text ? '-text' : ''}`;
      element.textContent = routePart.text;

      const marker = new mapboxgl.Marker({
        element,
        offset: routePart.offset,
        rotation: routePart.rotation,
      })
        .setLngLat(ROUTE_COORDS[routePart.pointIndex])
        .addTo(map);

      routePart.drawed = true;

      return marker;
    }

    const route = [
      {
        id: 'la',
        point: true,
        text: 'Los Angeles',
        offset: [0, -50],
        rotation: -7,
        pointIndex: 0,
      },
      {
        id: 'start',
        point: true,
        pointIndex: 0,
      },
      // {
      //   id: 'morrobay',
      //   point: true,
      //   text: 'Morro Bay',
      //   offset: [0, -50],
      //   rotation: -7,
      //   pointIndex: 2865,
      // },
      {
        id: 'toMonterey',
        point: false,
        routeIndex: [0, 6422],
      },
      {
        id: 'monterey',
        point: true,
        pointIndex: 6422,
      },
    ].map((p) => {
      p.element = document.getElementById(p.id);

      if (!p.point) {
        const { offsetHeight: elementHeight } = p.element;

        const pointsCount = p.routeIndex[1] - p.routeIndex[0] + 1;

        p.pixelsInRoutePoint = elementHeight / pointsCount;
      }

      return p;
    });

    const map = new mapboxgl.Map({
      container: $mapWestCoast.get(0),
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: ROUTE_COORDS[route[0].pointIndex], //[37.6173, 55.7558], // moscow
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
          'line-color': WC_COLOR,
          'line-width': 6,
          'line-opacity': 1,
        },
      });

      // a flight from Moscow to LA at start
      // map.flyTo({
      //   center: ROUTE_COORDS[route[0].pointIndex],
      //   minZoom: 2,
      //   essential: true,
      //   speed: 0.2,
      // });

      let lastDrawedIndex = 0;

      content.onscroll = _.throttle(() => {
        for (let i = 0; i < route.length; i++) {
          const part = route[i];

          const { offsetHeight: contentHeight, scrollTop } = content;
          const scrollBottom = scrollTop + contentHeight;
          const { offsetTop: elementTop } = part.element;

          // it's visible
          if (elementTop < scrollBottom) {
            if (part.point) {
              if (part.drawed) continue;

              addMapMarker(part, map);
            } else {
              const visibleRoutePointsCount = Math.floor(
                (scrollBottom - elementTop) / part.pixelsInRoutePoint
              );
              const lastVisibleIndex = visibleRoutePointsCount - 1;

              const mapAnimateOptions = {
                duration: 2000,
                essential: true,
              };

              if (lastVisibleIndex > lastDrawedIndex) {
                if (part.drawed) continue;

                const routeSliceToDraw = ROUTE_COORDS.slice(
                  lastDrawedIndex,
                  visibleRoutePointsCount
                );

                Array.prototype.push.apply(
                  routeGeojson.features[0].geometry.coordinates,
                  routeSliceToDraw
                );

                map.getSource('route').setData(routeGeojson);

                map.setZoom(MAP_ZOOM);
                map.panTo(_.last(routeSliceToDraw), mapAnimateOptions);

                // Uncomment to show current cursor position
                console.log(`Current coords: ${_.last(routeSliceToDraw)}`);

                lastDrawedIndex = lastVisibleIndex;

                if (lastDrawedIndex >= part.routeIndex[1]) {
                  part.drawed = true;
                }
              } else {
                map.panTo(ROUTE_COORDS[lastVisibleIndex], mapAnimateOptions);
              }
            }

            break;
          }
        }
      }, 10);
    });
  }
};
