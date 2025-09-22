<script lang="ts">
  import {
    circleMarker,
    geoJSON,
    type GeoJSON,
    LatLng,
    latLngBounds,
    type LeafletEvent,
    type Map,
    map,
    tileLayer,
  } from 'leaflet';
  import { onMount } from 'svelte';
  import {
    getAuthUser,
    getCurrentCoordinates,
    getGeometry,
    getStages,
    getTrip,
    setCurrentCoordinates,
    setStage,
  } from './store.svelte';

  let mapObj: Map;
  let layer: GeoJSON | undefined;

  let hideLayer = $state(false);
  let currentLocationMarker: any;

  onMount(() => {
    mapObj = map('map');
    tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
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
        radius: 5,
        fillOpacity: 0.5,
      });
      currentLocationMarker.addTo(mapObj);
    }
  });

  function onMapClick(e: LeafletEvent) {
    if (getAuthUser()) {
      const coordinates = (e as any).latlng as LatLng;
      setCurrentCoordinates(coordinates);
    }
  }

  $effect(() => {
    if (!getTrip()?.stages || getTrip().stages.length === 0) {
      mapObj.setView([0, 0], 3);
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
        hideLayer = true;
        mapObj.flyToBounds(latLngBounds([marker.getLatLng()]), {
          duration: 1,
          maxZoom: 10,
        });
        mapObj.once('moveend', () => (hideLayer = false));
        setStage(i);
      });
    });
  });
</script>

<div id="map" class:hide-layer={hideLayer}></div>

<style>
  #map {
    height: 35vh;
  }
  @media (min-width: 800px) {
    #map {
      height: 50vh;
    }
  }

  .hide-layer :global(.leaflet-overlay-pane) {
    display: none;
  }
</style>
