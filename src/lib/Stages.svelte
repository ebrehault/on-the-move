<script lang="ts">
  import { storeTripData } from './github';
  import {
    addTripStage,
    getCurrentCoordinates,
    getStages,
    getTrip,
    getTripId,
    getUser,
    setCurrentCoordinates,
  } from './store.svelte';

  let title = $state('');
  let date = $state('');
  let description = $state('');

  function createStage(e: Event) {
    e.preventDefault();
    const coordinates = getCurrentCoordinates();
    if (coordinates) {
      addTripStage({
        title,
        description,
        date,
        coordinates,
      });
      storeTripData(getUser(), getTripId(), getTrip()).then(() => {
        title = '';
        description = '';
        date = '';
        setCurrentCoordinates(undefined);
      });
    }
  }
</script>

<ul>
  {#each getStages() as stage}
    <li>{stage.title}</li>
  {/each}
</ul>
{#if getUser()}
  <h2>Add a new stage</h2>
  <form>
    <div>
      <label for="title">Title of the stage</label>
      <input
        type="text"
        bind:value={title}
      />
    </div>
    <div>
      <label for="title">Date</label>
      <input
        type="date"
        bind:value={date}
      />
    </div>
    <div>
      <label for="description">Description</label>
      <textarea bind:value={description}></textarea>
    </div>
    {#if !getCurrentCoordinates()}
      <div>Seelct a position by clicking on the map</div>
    {/if}
    <button
      onclick={createStage}
      disabled={!getCurrentCoordinates() || !title}
    >
      Add stage
    </button>
  </form>
{/if}
