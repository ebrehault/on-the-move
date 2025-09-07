<script lang="ts">
  import {
    addTripStage,
    getCurrentCoordinates,
    getStages,
    getTripId,
    getUser,
    getAuthUser,
    deleteStage,
    setCurrentCoordinates,
    setStage,
  } from './store.svelte';

  let title = $state('');
  let date = $state('');
  let description = $state('');
  let files: FileList | undefined = $state();

  function goToStage(stage: number) {
    setStage(stage);
  }

  function createStage(e: Event) {
    e.preventDefault();
    const coordinates = getCurrentCoordinates();
    if (coordinates) {
      addTripStage(
        {
          title,
          description,
          date,
          coordinates,
        },
        files,
      ).then(() => {
        title = '';
        description = '';
        date = '';
        files = undefined;
        setCurrentCoordinates(undefined);
      });
    }
  }
</script>

<ul>
  {#each getStages() as stage, i}
    <li>
      <a
        href={`#/${getUser()}/${getTripId()}/${i}`}
        onclick={() => goToStage(i)}
      >
        {stage.title}
      </a>
      {#if getAuthUser()}
        <button onclick={() => deleteStage(i)}>Delete stage</button>
      {/if}
    </li>
  {/each}
</ul>
{#if getAuthUser()}
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
    <div>
      <label for="files">Pictures</label>
      <input
        type="file"
        multiple
        bind:files
        accept="image/*"
      />
      {#if files}
        {#each Array.from(files) as file}
          <p>{file.name} ({file.size} bytes)</p>
        {/each}
      {/if}
    </div>
    {#if !getCurrentCoordinates()}
      <div>Select a position by clicking on the map</div>
    {/if}
    <button
      onclick={createStage}
      disabled={!getCurrentCoordinates() || !title}
    >
      Add stage
    </button>
  </form>
{/if}
