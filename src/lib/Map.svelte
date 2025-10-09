<script lang="ts">
  import {
    CircleMarker,
    circleMarker,
    geoJSON,
    type GeoJSON,
    LatLng,
    LatLngBounds,
    latLngBounds,
    type LeafletEvent,
    type Map,
    map,
    tileLayer,
  } from 'leaflet';
  import { onMount } from 'svelte';
  import {
    getCurrentCoordinates,
    getGeometry,
    getStages,
    getTrip,
    isEditMode,
    setCurrentCoordinates,
  } from './store.svelte';
  import { goToStage } from './navigation.svelte';

  let mapObj: Map;
  let layer: GeoJSON | undefined;

  let hideLayer = $state(false);
  let currentLocationMarker: any;
  let userPosition: any;

  onMount(() => {
    mapObj = map('map');
    tileLayer(
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
      currentLocationMarker = circleMarker(current, {
        radius: 15,
        fillOpacity: 0.5,
      });
      currentLocationMarker.addTo(mapObj);
      if (!isEditMode()) {
        zoomToStage(currentLocationMarker);
      }
    } else {
      if (layer && !isEditMode()) {
        zoomTo(layer.getBounds());
      }
      if (isEditMode()) {
        mapObj.locate({ setView: true, maxZoom: 22 });
        displayUserPosition();
      }
    }
  });

  function onMapClick(e: LeafletEvent) {
    if (isEditMode()) {
      const coordinates = (e as any).latlng as LatLng;
      setCurrentCoordinates(coordinates);
    }
  }

  $effect(() => {
    if (!getTrip()?.stages || getTrip().stages.length === 0) {
      return;
    }
    const geometry = getGeometry();
    if (geometry.features.length > 0) {
      layer = geoJSON(geometry).addTo(mapObj);
      mapObj.fitBounds(layer.getBounds());
    } else {
      mapObj.setView(getStages()[0].coordinates, 10);
    }
    getStages().forEach((stage, i) => {
      const marker = circleMarker(stage.coordinates, {
        radius: 5,
        fillOpacity: 0.5,
      });
      marker.addTo(mapObj);
      marker.on('click', () => {
        zoomToStage(marker);
        goToStage(i);
      });
    });
  });

  function zoomToStage(marker: CircleMarker) {
    zoomTo(latLngBounds([marker.getLatLng()]));
  }

  function zoomTo(bounds: LatLngBounds) {
    hideLayer = true;
    mapObj.flyToBounds(bounds, {
      duration: 1,
      maxZoom: 10,
    });
    mapObj.once('moveend', () => (hideLayer = false));
  }

  function displayUserPosition() {
    if (userPosition) {
      mapObj.removeLayer(userPosition);
    }
    navigator.geolocation.getCurrentPosition((position) => {
      userPosition = circleMarker(
        [position.coords.latitude, position.coords.longitude],
        { stroke: false, radius: 10 },
      ).addTo(mapObj);
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
