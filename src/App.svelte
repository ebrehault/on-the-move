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
    setAuthUser,
  } from './lib/store.svelte';
  import Header from './lib/Header.svelte';
  import { parseHash } from './lib/navigation.svelte';

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
  <Header></Header>

  {#if getPage() === PAGE.Home}
    <Home />
  {:else if getPage() === PAGE.Delete}
    <Delete />
  {:else}
    <div class="md:flex md:flex-row">
      <div class="sticky top-15 z-0">
        <Map />
      </div>
      <div class="md:flex-grow">
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
