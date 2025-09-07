<script lang="ts">
  import { createTrip, getTripsList } from './github';
  import { getAuthUser, loadTrip, PAGE, setPage } from './store.svelte';

  let trips: string[] = $state([]);
  let tripName = $state('');

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
{/if}
