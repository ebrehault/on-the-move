<script lang="ts">
  import DeleteButton from './components/DeleteButton.svelte';
  import EditButton from './components/EditButton.svelte';
  import ShareButton from './components/ShareButton.svelte';
  import { getPictureUrl } from './github';
  import StageForm from './StageForm.svelte';
  import {
    deletePictureFromStage,
    getAuthUser,
    getStage,
    getTrip,
    getTripId,
    getUser,
    setCurrentCoordinates,
    type Stage,
  } from './store.svelte';

  let stage: Stage | undefined = $state();
  let mode = $state('read');
  let stageIndex = $state(-1);
  let currentPicture = $state('');

  $effect(() => {
    stageIndex = getStage();
    const stages = getTrip()?.stages;
    if (stageIndex > -1 && stages && stages.length > stageIndex) {
      stage = getTrip().stages[stageIndex];
      setCurrentCoordinates(stage.coordinates);
    } else {
      stage = undefined;
    }
  });

  function showPicture(e: Event, picture: string) {
    e.preventDefault();
    currentPicture = picture;
    mode = 'show-picture';
  }

  function closePicture(e: Event) {
    e.preventDefault();
    currentPicture = '';
    mode = 'read';
  }
</script>

<div class="p-4">
  {#if stage}
    {#if mode === 'edit'}
      <StageForm onclose={() => (mode = 'read')} {stage} {stageIndex}
      ></StageForm>
    {:else if mode === 'show-picture'}
      <a href="#" onclick={closePicture}>
        <img
          src={getPictureUrl(getUser(), getTripId(), currentPicture)}
          alt={currentPicture}
          class="w-full fixed top-0 left-0 z-[100000]"
        />
      </a>
    {:else}
      {#if stage.pictures && stage.pictures.length > 0}
        <div
          class="flex overflow-x-scroll space-x-4 rounded-lg no-scrollbar mb-2.5"
        >
          {#each stage.pictures as picture}
            <div
              class="relative flex-shrink-0 w-full md:w-3/4 lg:w-2/3 scroll-ml-6"
            >
              <a href="#" onclick={(e) => showPicture(e, picture)}>
                <img
                  src={getPictureUrl(getUser(), getTripId(), picture)}
                  alt={picture}
                  class="w-full h-[500px] object-cover rounded-lg"
                />
              </a>
              {#if getAuthUser()}
                <div class="absolute top-0 right-0 p-1">
                  <DeleteButton
                    onclick={() => deletePictureFromStage(getStage(), picture)}
                  ></DeleteButton>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <p class="uppercase font-semibold text-xs mb-1 text-indigo-600">
        {stage.date}
      </p>
      <div class="flex">
        <h1 class="text-3xl font-bold">
          {stage.title}
        </h1>
        {#if getAuthUser()}
          <div class="ml-auto">
            <EditButton onclick={() => (mode = 'edit')}></EditButton>
          </div>
        {/if}
      </div>
      <div class="mb-4">{stage.description}</div>
      <ShareButton></ShareButton>
    {/if}
  {/if}
</div>
