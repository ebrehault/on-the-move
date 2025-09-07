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
  } from './store.svelte';

  let stage: Stage | undefined = $state();

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
</script>

<div>
  {#if stage}
    <h2>{stage.title}</h2>
    <div>{stage.date}</div>
    <div>{stage.description}</div>
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
  {/if}
</div>

<style>
  @import './StageDetail.css';
</style>
