<script lang="ts">
  import { getPhotoUrl } from './github';
  import { getStage, getTrip, getTripId, getUser, type Stage } from './store.svelte';

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
      <div class="photos">
        {#each stage.pictures as picture}
          <img src={getPhotoUrl(getUser(), getTripId(), picture)} />
        {/each}
      </div>
    {/if}
    <button onclick={copyUrl}>Copy to share URL</button>
  {/if}
</div>
