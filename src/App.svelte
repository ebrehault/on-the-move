<script lang="ts">
  import { onMount } from 'svelte';
  import Delete from './lib/Delete.svelte';
  import Footer from './lib/Footer.svelte';
  import { ACCESS_TOKEN_STORAGE_KEY, getCurrentAuthUser } from './lib/github';
  import Home from './lib/Home.svelte';
  import Map from './lib/Map.svelte';
  import StageDetail from './lib/StageDetail.svelte';
  import Stages from './lib/Stages.svelte';
  import {
    PAGE,
    TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
    getPage,
    getStage,
    getTripId,
    getUser,
    loadTrip,
    setAuthUser,
    setPage,
    setStage,
  } from './lib/store.svelte';

  function parseHash() {
    if (location.hash === '#DELETE') {
      setPage(PAGE.Delete);
    } else {
      const params = location.hash.split('/');
      if (params.length >= 3) {
        loadTrip(params[1], params[2]);
        if (params.length === 3) {
          setPage(PAGE.Trip);
        } else {
          let stage = parseInt(params[3], 10);
          stage = isNaN(stage) ? -1 : stage;
          setStage(stage);
        }
      } else {
        setPage(PAGE.Home);
      }
    }
  }

  onMount(() => {
    parseHash();
    const url = new URL(location.href);
    const token = url.searchParams.get(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER);
    if (token) {
      url.searchParams.delete(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER);
      url.searchParams.delete('type');
      history.replaceState(undefined, '', url);
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    }

    getCurrentAuthUser().then((user) => setAuthUser(user));

    window.onhashchange = parseHash;
  });

  $effect(() => {
    const user = getUser();
    const trip = getTripId();
    const stage = getStage();
    if (user && trip) {
      if (stage === -1) {
        location.hash = `#/${user}/${trip}`;
      } else {
        location.hash = `#/${user}/${trip}/${stage}`;
      }
    }
  });
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<main class="relative bg-slate-50">
  <header
    class="sticky top-0 left-0 right-0 z-1 bg-indigo-900 h-15 flex items-center px-4"
  >
    <h1 class="text-3xl text-white">On the move</h1>
  </header>

  {#if getPage() === PAGE.Home}
    <Home />
  {:else if getPage() === PAGE.Delete}
    <Delete />
  {:else}
    <div class="md:flex md:flex-row">
      <div class="md:flex-grow">
        <div class="sticky top-15 z-0">
          <Map />
        </div>
      </div>
      <div>
        {#if getPage() === PAGE.Trip}
          <Stages />
        {/if}
        {#if getPage() === PAGE.Stage}
          <StageDetail />
        {/if}
      </div>
    </div>
  {/if}
</main>
<Footer></Footer>
