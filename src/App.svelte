<script lang="ts">
  import { onMount } from 'svelte';
  import Map from './lib/Map.svelte';
  import Stages from './lib/Stages.svelte';
  import Delete from './lib/Delete.svelte';
  import StageDetail from './lib/StageDetail.svelte';
  import {
    PAGE,
    TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
    CLIENT_ID,
    REDIRECT,
    getAuthUser,
    getPage,
    getStage,
    getTripId,
    getUser,
    loadTrip,
    setPage,
    setStage,
    setAuthUser,
  } from './lib/store.svelte';
  import { ACCESS_TOKEN_STORAGE_KEY, getCurrentAuthUser, removeToken } from './lib/github';
  import Home from './lib/Home.svelte';

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
          const stage = parseInt(params[3], 10);
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

  function logout() {
    removeToken();
    setAuthUser('');
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""
  />
</svelte:head>

<main>
  {#if getPage() === PAGE.Home}
    <Home />
  {:else if getPage() === PAGE.Delete}
    <Delete />
  {:else}
    <Map />
    {#if getPage() === PAGE.Trip}
      <Stages />
    {/if}
    {#if getPage() === PAGE.Stage}
      <StageDetail />
    {/if}
  {/if}
  {#if !getAuthUser()}
    <a
      href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=public_repo,user&redirect_uri=https://auth.abfab.dev/github-callback?destination=${REDIRECT}`}
    >
      Login with GitHub
    </a>
  {:else}
    Logged as {getAuthUser()}
    <button onclick={logout}>Logout</button>
  {/if}
</main>
