<script lang="ts">
  import { storeTripData, storePhoto } from './github';
  import {
    addTripStage,
    getCurrentCoordinates,
    getStages,
    getTrip,
    getTripId,
    getUser,
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
      addTripStage({
        title,
        description,
        date,
        coordinates,
        pictures: files ? Array.from(files).map((f) => f.name) : undefined,
      });
      storeTripData(getUser(), getTripId(), getTrip())
        .then(() => {
          if (files) {
            Array.from(files).forEach((f) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const b64 = (reader.result as string).split('base64,')[1];
                storePhoto(getUser(), getTripId(), f.name, b64).then(() => console.info(`${f.name} stored`));
              };
              reader.readAsDataURL(f);
            });
          }
        })
        .then(() => {
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
    </li>
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
    <div>
      <label for="files">Photos</label>
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
