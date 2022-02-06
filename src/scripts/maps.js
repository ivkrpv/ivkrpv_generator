import _ from 'lodash';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import config from '../_data/config.json';
import nycData from '../_data/map_nyc.json';
import wcData from '../_data/map_wc.json';

mapboxgl.accessToken = config.mapboxToken;

const NY_MARKER_COLOR = '#e7254d';
const NY_MARKER_STROKE_COLOR = '#c41639';
const WC_ROUTE_COLOR = '#f42e25';
const DEV_MODE = false;
const DEV_MODE_WHOLE_ROUTE = false;
const VIEW_MODE = {
  FOLLOW: 0,
  PASSED: 1,
  TOTAL: 2,
};

// Here is a list of features added during scroll event
const onScrollFeatures = [
  {
    id: 'la-point',
    index: 0,
    important: true,
  },
  {
    id: 'la-label',
    index: 0,
    text: 'LA',
    offset: [0, -30],
    rotation: -7,
    important: true,
  },
  {
    id: 'seattle-point',
    index: 30000,
    important: true,
  },
  {
    id: 'seattle-label',
    index: 30000,
    text: 'Seattle',
    offset: [110, 20],
    rotation: -7,
    important: true,
  },
  {
    id: 'la-monterey-route',
    index: [0, 6422],
  },
  {
    id: 'monterey-sf-route',
    index: [6423, 9137],
  },
  {
    id: 'sf-santa-rosa-route',
    index: [9138, 15029],
  },
  {
    id: 'santa-rosa-oregon-route',
    index: [15030, 25380],
  },
  {
    id: 'coos-bay-portland-route',
    index: [25381, 28073],
  },
  {
    id: 'portland-seattle-route',
    index: [28074, 30000],
  },
];

// List of features added during route drawing
const routeFeatures = [
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
    index: 9137,
    text: 'SF 🌉',
    offset: [40, -50],
    rotation: -7,
    important: true,
  },
  {
    index: 9137,
    important: true,
  },
  {
    index: 13524,
    text: 'Point Reyes',
    offset: [-130, 10],
    rotation: -7,
  },
  {
    index: 15029,
    text: 'Santa Rosa',
    offset: [60, -50],
    rotation: -7,
  },
  {
    index: 16523,
    text: 'Fort Ross',
    offset: [-130, 10],
    rotation: -7,
  },
  {
    index: 20840,
    text: 'Leggett',
    offset: [80, 30],
    rotation: -7,
  },
  {
    index: 25380,
    text: 'Coos Bay',
    offset: [110, 10],
    rotation: -7,
  },
  {
    index: 26586,
    text: "Thor's Well",
    offset: [-130, 0],
    rotation: -7,
  },
  {
    index: 28073,
    text: 'Portland',
    offset: [110, 20],
    rotation: -7,
    important: true,
  },
  {
    index: 28073,
    important: true,
  },
  {
    index: 28335,
    text: 'Multnomah Falls',
    offset: [40, -60],
    rotation: -7,
  },
];

function angleBetweenPoints(cx, cy, ex, ey) {
  const dy = ey - cy;
  const dx = ex - cx;
  let theta = Math.atan2(dy, dx);

  theta *= 180 / Math.PI;

  return theta;
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

    function addRouteMarker(point, map) {
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

      marker.important = point.important;

      point.drawed = true;

      return marker;
    }

    onScrollFeatures.map((f) => {
      f.element = document.getElementById(f.id);

      if (_.isArray(f.index)) {
        const { offsetHeight: elementHeight } = f.element;
        const pointsCount = f.index[1] - f.index[0] + 1;

        f.route = true;
        f.pixelsInRoutePoint = elementHeight / pointsCount;
      }

      return f;
    });

    const map = new mapboxgl.Map({
      container: $mapWestCoast.get(0),
      style: 'mapbox://styles/ivkrpv/ckhk9kj5x54mr19o5u7pp1pml',
      center: DEV_MODE ? ROUTE_COORDS[0] : [37.6173, 55.7558],
      zoom: MAP_ZOOM,
      attributionControl: false,
      interactive: DEV_MODE,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      if (DEV_MODE_WHOLE_ROUTE) {
        map.addSource('route_points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: ROUTE_COORDS.map((coordinates, index) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates,
              },
              properties: {
                index,
              },
            })),
          },
        });

        map.addLayer({
          id: 'route_index',
          type: 'circle',
          source: 'route_points',
          paint: {
            'circle-radius': 4,
            'circle-color': 'blue',
          },
        });

        map.on('click', 'route_index', function ({ features: [feature], lngLat: { lng, lat } }) {
          const coordinates = feature.geometry.coordinates.slice();

          while (Math.abs(lng - coordinates[0]) > 180) {
            coordinates[0] += lng > coordinates[0] ? 360 : -360;
          }

          const { index } = feature.properties;

          let html = `<h6 class="mr-3 font-weight-bold">Info</h6>
            <div>Lng: ${lng}</div>
            <div>Lat: ${lat}</div>
            <div>Index: ${index}</div>`;

          new mapboxgl.Popup().setLngLat(coordinates).setHTML(html).addTo(map);
        });

        map.on('mouseenter', 'route_index', function () {
          map.getCanvas().style.cursor = 'crosshair';
        });

        map.on('mouseleave', 'route_index', function () {
          map.getCanvas().style.cursor = '';
        });
      }

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

      const routeHeadEl = document.createElement('div');
      routeHeadEl.className = 'wc-route-head';

      const routeHeadMarker = new mapboxgl.Marker({ element: routeHeadEl });

      const markers = [];
      let viewMode = VIEW_MODE.FOLLOW;

      // Whole route overview
      map.on('click', () => {
        if (DEV_MODE_WHOLE_ROUTE) return;

        const coordinates = routeGeojson.features[0].geometry.coordinates;

        if (!coordinates.length) return;

        const padding = window.innerWidth < 576 ? 24 : 48;

        if (viewMode === VIEW_MODE.FOLLOW) {
          viewMode = VIEW_MODE.PASSED;

          const bounds = new mapboxgl.LngLatBounds();

          coordinates.forEach((c) => bounds.extend(c));

          markers.forEach((m) => {
            if (!m.important) m.remove();
          });

          map.fitBounds(bounds, { padding });
        } else if (viewMode === VIEW_MODE.PASSED) {
          viewMode = VIEW_MODE.TOTAL;

          const bounds = new mapboxgl.LngLatBounds();

          coordinates.forEach((c) => bounds.extend(c));

          markers.filter((m) => m.important).forEach((m) => bounds.extend(m.getLngLat()));

          map.fitBounds(bounds, { padding });
        } else {
          viewMode = VIEW_MODE.FOLLOW;

          markers.forEach((m) => {
            if (!m.important) m.addTo(map);
          });

          map.flyTo({ center: _.last(coordinates), zoom: MAP_ZOOM });
        }
      });

      // a flight from Moscow to LA at start
      if (!DEV_MODE) {
        map.flyTo({
          center: ROUTE_COORDS[0],
          minZoom: 2,
          essential: true,
          speed: 0.7,
        });
      }

      let lastDrawedIndex = 0;

      content.onscroll = _.throttle(() => {
        if (viewMode !== VIEW_MODE.FOLLOW) {
          viewMode = VIEW_MODE.FOLLOW;

          markers.forEach((m) => {
            if (!m.important) m.addTo(map);
          });
        }

        onScrollFeatures.forEach((feature) => {
          const { offsetHeight: contentHeight, scrollTop } = content;
          const scrollBottom = scrollTop + contentHeight;
          const { offsetTop: elementTop, offsetHeight: elementHeight } = feature.element;
          const elementBottom = elementTop + elementHeight;

          // if it's not a route just add it to the map (it's a marker or a label)
          if (!feature.route && elementTop < scrollBottom) {
            if (!feature.drawed) {
              markers.push(addRouteMarker(feature, map));
            }

            return;
          }

          // it's visible
          if (elementTop < scrollBottom && elementBottom > scrollTop) {
            const visibleRoutePointsCount = Math.floor(
              (scrollBottom - elementTop) / feature.pixelsInRoutePoint
            );
            const lastVisibleIndex = feature.index[0] + visibleRoutePointsCount - 1;

            if (lastVisibleIndex > lastDrawedIndex) {
              if (feature.drawed) return;

              const routeSliceToDraw = ROUTE_COORDS.slice(lastDrawedIndex, lastVisibleIndex + 1);

              Array.prototype.push.apply(
                routeGeojson.features[0].geometry.coordinates,
                routeSliceToDraw
              );

              map.getSource('route').setData(routeGeojson);

              const lastPoint = _.last(routeSliceToDraw);
              let secondLastPoint =
                ROUTE_COORDS[lastVisibleIndex - 40] ||
                ROUTE_COORDS[lastVisibleIndex - 20] ||
                ROUTE_COORDS[lastVisibleIndex - 10];

              // show route arrow head
              routeHeadMarker.setLngLat(lastPoint);

              if (secondLastPoint) {
                routeHeadMarker.setRotation(
                  angleBetweenPoints(
                    secondLastPoint[1],
                    secondLastPoint[0],
                    lastPoint[1],
                    lastPoint[0]
                  )
                );
              }

              routeHeadMarker.addTo(map);

              map.flyTo({ center: lastPoint, zoom: MAP_ZOOM, speed: 0.5, essential: true });

              routeFeatures.forEach((feature) => {
                if (feature.drawed || feature.index > lastVisibleIndex) return;

                markers.push(addRouteMarker(feature, map));
              });

              lastDrawedIndex = lastVisibleIndex;

              if (lastDrawedIndex >= feature.index[1]) {
                feature.drawed = true;

                // hide route arrow head
                routeHeadMarker.remove();
              }
            } else if (lastVisibleIndex < lastDrawedIndex) {
              map.flyTo({
                center: ROUTE_COORDS[lastVisibleIndex],
                zoom: MAP_ZOOM,
                speed: 0.5,
                essential: true,
              });
            }
          }
        });
      }, 10);
    });
  }
};
