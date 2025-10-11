<script lang="ts">
  import DeleteButton from './components/DeleteButton.svelte';
  import EditButton from './components/EditButton.svelte';
  import OverlaySpinner from './components/OverlaySpinner.svelte';
  import ShareButton from './components/ShareButton.svelte';
  import Image from './Image.svelte';
  import StageForm from './StageForm.svelte';
  import {
    deletePictureFromStage,
    getCurrentPicture,
    getStage,
    getTrip,
    isEditMode,
    isOwner,
    setCurrentCoordinates,
    setCurrentPicture,
    setEditMode,
    setNotification,
    type Stage,
  } from './store.svelte';

  let stage: Stage | undefined = $state();
  let stageIndex = $state(-1);
  let deleting = $state(false);

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

  let shareText = $derived(
    stage
      ? stage.description
        ? `${stage.title}\n\n${stage.description}`
        : stage.title
      : '',
  );

  function showPicture(e: Event, picture: string) {
    e.preventDefault();
    setCurrentPicture(picture);
  }

  function closePicture(e: Event) {
    e.preventDefault();
    setCurrentPicture('');
  }

  function _deletePictureFromStage(picture: string) {
    deleting = true;
    deletePictureFromStage(getStage(), picture).then((success) => {
      deleting = false;
      setNotification({
        status: success ? 'SUCCESS' : 'FAILURE',
        message: success
          ? 'Picture deleted'
          : 'Error when deleting the picture',
      });
    });
  }
</script>

<div class="p-4 relative">
  {#if deleting}
    <OverlaySpinner></OverlaySpinner>
  {/if}
  {#if stage}
    {#if isEditMode()}
      <StageForm onclose={() => setEditMode(false)} {stage} {stageIndex}
      ></StageForm>
    {:else if !!getCurrentPicture()}
      <a href="#" onclick={closePicture}>
        <Image
          picture={getCurrentPicture()}
          classes="object-cover fixed top-0 left-0 z-[100000]"
        ></Image>
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
                <Image
                  {picture}
                  classes="w-full h-[500px] object-cover rounded-lg"
                ></Image>
              </a>
              {#if isOwner()}
                <div class="absolute top-0 right-0 p-1">
                  <DeleteButton onclick={() => _deletePictureFromStage(picture)}
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
        {#if isOwner()}
          <div class="ml-auto">
            <EditButton onclick={() => setEditMode(true)}></EditButton>
          </div>
        {/if}
      </div>
      <div class="my-4 md:my-8">{stage.description}</div>
      <ShareButton></ShareButton>
      {#if shareText}
        <ShareButton text={shareText}></ShareButton>
      {/if}
    {/if}
  {/if}
</div>
