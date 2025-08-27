<script lang="ts">
  import { circleMarker, geoJSON, type GeoJSON, latLngBounds, type Map, map, tileLayer } from 'leaflet';
  import { onMount } from 'svelte';
  import { getGeometry, getStages } from './store.svelte';

  let { clickStage } = $props();

  let mapObj: Map;
  let layer: GeoJSON | undefined;

  let hideLayer = $state(false);

  onMount(() => {
    mapObj = map('map');
    tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
      minZoom: 2,
    }).addTo(mapObj);
  });

  $effect(() => {
    const geometry = getGeometry();
    if (geometry.features.length === 0) {
      mapObj.setView([0, 0], 3);
      return;
    }
    layer = geoJSON(geometry).addTo(mapObj);
    mapObj.fitBounds(layer.getBounds());
    getStages().forEach((stage) => {
      const marker = circleMarker([stage.coordinates[1], stage.coordinates[0]], {
        radius: 5,
        fillOpacity: 0.5,
      });
      marker.addTo(mapObj);
      marker.on('click', () => {
        hideLayer = true;
        mapObj.flyToBounds(latLngBounds([marker.getLatLng()]), { duration: 1 });
        mapObj.once('moveend', () => (hideLayer = false));
        clickStage(stage);
      });
    });
  });
</script>

<div
  id="map"
  class:hide-layer={hideLayer}
></div>

<style>
  @import './Map.css';
</style>
