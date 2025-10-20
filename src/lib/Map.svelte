<script lang="ts">
  import * as L from 'leaflet';
  import '@elfalem/leaflet-curve';
  import { onMount } from 'svelte';
  import {
    getCurrentCoordinates,
    getGeometry,
    getStageGeometry,
    getStages,
    getTrip,
    isEditMode,
    setCurrentCoordinates,
    setCurrentPicture,
  } from './store.svelte';
  import { goToStage } from './navigation.svelte';
  import type { Point } from 'geojson';

  let mapObj: L.Map;
  let layer: L.GeoJSON | undefined;
  let stageLayer: L.GeoJSON | undefined;

  let hideLayer = $state(false);
  let currentLocationMarker: L.CircleMarker;
  let userPosition: any;

  onMount(() => {
    mapObj = L.map('map');
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 24,
        minZoom: 2,
      },
    ).addTo(mapObj);
    mapObj.on('click', onMapClick);
  });

  $effect(() => {
    const current = getCurrentCoordinates();
    if (currentLocationMarker) {
      mapObj.removeLayer(currentLocationMarker);
    }
    if (current) {
      currentLocationMarker = L.circleMarker(current, {
        radius: 15,
        fillOpacity: 0.5,
      });
      currentLocationMarker.addTo(mapObj);
      if (!isEditMode()) {
        zoomToStage(currentLocationMarker.getLatLng());
      }
    } else {
      if (layer && !isEditMode()) {
        zoomTo(undefined, layer.getBounds());
      }
      if (isEditMode()) {
        mapObj.locate({ setView: true, maxZoom: 22 });
        setUserPosition();
      }
    }
  });

  function onMapClick(e: L.LeafletEvent) {
    if (isEditMode()) {
      const coordinates = (e as any).latlng as L.LatLng;
      setCurrentCoordinates(coordinates);
    }
  }

  $effect(() => {
    if (!getTrip()?.stages || getTrip().stages.length === 0) {
      return;
    }
    const geometry = getGeometry();
    if (geometry.features.length > 0) {
      layer = L.geoJSON(geometry, {
        onEachFeature: (feature, layer) => {
          layer.on({
            click: () => {
              const point = feature.geometry as Point;
              zoomToStage(
                L.latLng([point.coordinates[0], point.coordinates[1], 0]),
              );
              goToStage(feature.properties.index);
            },
          });
        },
      }).addTo(mapObj);
      mapObj.fitBounds(layer.getBounds());
    } else {
      mapObj.setView(getStages()[0].coordinates, 10);
    }

    getStages().forEach((stage, i) => {
      if (i > 0) {
        getCurvedPath(getStages()[i - 1].coordinates, stage.coordinates).addTo(
          mapObj,
        );
      }
    });
  });

  function getCurvedPath(point1: L.LatLng, point2: L.LatLng) {
    const offsetX = point2.lng - point1.lng;
    const offsetY = point2.lat - point1.lat;

    const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
    const theta = Math.atan2(offsetY, offsetX);

    const thetaOffset = Math.PI / 10;

    const r2 = r / 2 / Math.cos(thetaOffset);
    const theta2 = theta + thetaOffset;

    const midpointX = r2 * Math.cos(theta2) + point1.lng;
    const midpointY = r2 * Math.sin(theta2) + point1.lat;
    return L.curve(
      [
        'M',
        [point1.lat, point1.lng],
        'Q',
        [midpointY, midpointX],
        [point2.lat, point2.lng],
      ],
      {
        weight: 2,
      },
    );
  }

  $effect(() => {
    const stageGeom = getStageGeometry();
    if (stageGeom && stageGeom.features.length > 0) {
      stageLayer = L.geoJSON(stageGeom, {
        onEachFeature: (feature, layer) => {
          layer.on({
            click: () => setCurrentPicture(feature.properties?.picture || ''),
          });
        },
      }).addTo(mapObj);
      mapObj.fitBounds(stageLayer.getBounds());
    } else {
      if (stageLayer) {
        mapObj.removeLayer(stageLayer);
        stageLayer = undefined;
      }
    }
  });

  function zoomToStage(point: L.LatLng) {
    zoomTo(point);
  }

  function zoomTo(point?: L.LatLng, bounds?: L.LatLngBounds) {
    hideLayer = true;
    const options = {
      duration: 1,
      maxZoom: 10,
    };
    if (point) {
      mapObj.flyTo(point, 10, options);
    } else if (bounds) {
      mapObj.flyToBounds(bounds, options);
    }
    mapObj.once('moveend', () => (hideLayer = false));
  }

  function setUserPosition() {
    if (userPosition) {
      mapObj.removeLayer(userPosition);
    }
    navigator.geolocation.getCurrentPosition((position) => {
      userPosition = L.circleMarker(
        [position.coords.latitude, position.coords.longitude],
        { stroke: false, radius: 10 },
      ).addTo(mapObj);
      setCurrentCoordinates(
        L.latLng([position.coords.latitude, position.coords.longitude]),
      );
    });
  }
</script>

<div id="map" class:hide-layer={hideLayer}></div>

<style>
  #map {
    height: 30vh;
  }
  @media (min-width: 800px) {
    #map {
      height: calc(100dvh - calc(var(--spacing) * 15));
      width: 40vw;
    }
  }

  .hide-layer :global(.leaflet-overlay-pane) {
    display: none;
  }
</style>
