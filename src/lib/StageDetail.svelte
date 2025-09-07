<script lang="ts">
  import { getPictureUrl } from './github';
  import {
    getStage,
    getTrip,
    getTripId,
    getUser,
    type Stage,
    deletePictureFromStage,
    getAuthUser,
    updateStage,
  } from './store.svelte';

  let stage: Stage | undefined = $state();
  let editMode = $state(false);

  $effect(() => {
    const stageIndex = getStage();
    const stages = getTrip()?.stages;
    if (stageIndex > -1 && stages && stages.length > stageIndex) {
      stage = getTrip().stages[stageIndex];
    } else {
      stage = undefined;
    }
  });

  function copyUrl() {
    navigator.clipboard.writeText(location.href);
  }

  function save(e: MouseEvent) {
    e.preventDefault();
    updateStage().then(() => (editMode = false));
  }
</script>

<div>
  {#if stage}
    {#if !editMode}
      <h2>{stage.title}</h2>
      <div>{stage.date}</div>
      <div>{stage.description}</div>
      {#if getAuthUser()}
        <button onclick={() => (editMode = true)}>Edit</button>
      {/if}
      {#if stage.pictures && stage.pictures.length > 0}
        <div class="pictures">
          {#each stage.pictures as picture}
            <img src={getPictureUrl(getUser(), getTripId(), picture)} />
            {#if getAuthUser()}
              <button onclick={() => deletePictureFromStage(getStage(), picture)}>Delete picture</button>
            {/if}
          {/each}
        </div>
      {/if}
      <button onclick={copyUrl}>Copy to share URL</button>
    {:else}
      <h2>Modify the stage</h2>
      <form>
        <div>
          <label for="title">Title of the stage</label>
          <input
            type="text"
            bind:value={stage.title}
          />
        </div>
        <div>
          <label for="title">Date</label>
          <input
            type="date"
            bind:value={stage.date}
          />
        </div>
        <div>
          <label for="description">Description</label>
          <textarea bind:value={stage.description}></textarea>
        </div>
        <button onclick={save}>Save</button>
      </form>
    {/if}
  {/if}
</div>

<style>
  @import './StageDetail.css';
</style>
