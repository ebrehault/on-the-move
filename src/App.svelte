<script lang="ts">
  import { onMount } from 'svelte';
  import Map from './lib/Map.svelte';
  import Stages from './lib/Stages.svelte';
  import {
    PAGE,
    type Stage,
    TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER,
    getPage,
    getUser,
    loadTrip,
    setPage,
    setUser,
  } from './lib/store.svelte';
  import { ACCESS_TOKEN_STORAGE_KEY, createRepository, getCurrentUser, setTripData } from './lib/github';
  import Home from './lib/Home.svelte';

  onMount(() => {
    const params = location.hash.split('/');
    if (params.length === 3) {
      loadTrip(params[1], params[2]);
      setPage(PAGE.Trip);
    }
    const url = new URL(location.href);
    const token = url.searchParams.get(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER);
    if (token) {
      url.searchParams.delete(TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER);
      url.searchParams.delete('github');
      history.replaceState(undefined, '', url);
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    }

    getCurrentUser().then((user) => setUser(user));
  });
  function createRepo() {
    const user = getUser();
    if (!user) {
      return;
    }
    createRepository().then(() => console.log('success'));
  }

  function testChangeData() {
    const user = getUser();
    if (!user) {
      return;
    }
    setTripData('ebrehault', 'trip1', {
      title: 'My first trip CHANGED',
      stages: [
        { title: 'Departure', coordinates: [-0.09, 51.505], description: 'We left very early.' },
        {
          title: 'Arrival',
          coordinates: [-0.07, 51.515],
          description: 'The travel was amazing.',
          pictures: ['picture1.jpg'],
        },
      ],
    }).then(() => console.log('success'));
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
  {:else if getPage() === PAGE.Trip}
    <Map clickStage={(stage: Stage) => console.log(stage.title)} />
    <Stages />
  {/if}
  {#if !getUser()}
    <a
      href="https://github.com/login/oauth/authorize?client_id=Ov23lieVbXnlw4xgyzT9&scope=public_repo,user&redirect_uri=http://localhost:4567/github-callback?destination=http://localhost:5173"
    >
      Login with GitHub
    </a>
  {:else}
    Logged as {getUser()}
    <button onclick={createRepo}>Create repo</button>
    <button onclick={testChangeData}>Change data</button>
  {/if}
</main>
