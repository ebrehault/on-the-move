<script lang="ts">
  import { onMount } from 'svelte';
  import { createTrip, getTripsList, hasRepository } from './github';
  import { CLIENT_ID, REDIRECT, getAuthUser, loadTrip, PAGE, setPage, deleteTrip } from './store.svelte';

  let trips: string[] = $state([]);
  let tripName = $state('');
  let hasRepo = $state(false);

  $effect(() => {
    const user = getAuthUser();
    if (user) {
      getTripsList(user).then((_trips) => {
        if (_trips) {
          trips = _trips;
        }
      });
    }
  });

  function showTrip(trip: string) {
    loadTrip(getAuthUser(), trip);
    setPage(PAGE.Trip);
  }

  function addTrip(event: Event) {
    event.preventDefault();
    const user = getAuthUser();
    if (user) {
      createTrip(user, tripName).then((tripId) => showTrip(tripId));
    }
  }

  $effect(() => {
    if (getAuthUser()) {
      hasRepository(getAuthUser()).then((has) => (hasRepo = has));
    }
  });
</script>

<h1>Welcome</h1>
{#if !getAuthUser()}
  To create a trip in On The Move, you need to login.
{:else}
  {#if trips.length === 0}
    <h2>Create your first trip</h2>
  {:else}
    <h2>Your trips</h2>
    <ul>
      {#each trips as trip}
        <li>
          <a
            href={`#/${getAuthUser()}/${trip}`}
            onclick={() => showTrip(trip)}
          >
            {trip}
          </a>
          <button onclick={deleteTrip(trip)}>Delete trip</button>
        </li>
      {/each}
    </ul>
    <h2>Add a new trip</h2>
  {/if}
  <form>
    <label for="tripName">Name of the trip</label>
    <input
      type="text"
      id="tripName"
      bind:value={tripName}
    />
    <button onclick={addTrip}>Create</button>
  </form>
  {#if hasRepo}
    <div>
      If you want to delete all your data stored in this application, you need to <a
        href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=public_repo,user,delete_repo&redirect_uri=https://auth.abfab.dev/github-callback?destination=${REDIRECT}/#DELETE`}
      >
        re-authenticate to GitHub with adminsitrator access rights
      </a>
    </div>
  {/if}
{/if}
