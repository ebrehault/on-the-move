<script lang="ts">
  import DeleteButton from './components/DeleteButton.svelte';
  import EditButton from './components/EditButton.svelte';
  import OverlaySpinner from './components/OverlaySpinner.svelte';
  import ShareButton from './components/ShareButton.svelte';
  import { getPictureUrl } from './github';
  import { getStageUrl, goToStage } from './navigation.svelte';
  import StageForm from './StageForm.svelte';
  import {
    deleteStage,
    getAuthUser,
    isEditMode,
    getStages,
    getTripId,
    getUser,
    setCurrentCoordinates,
    setEditMode,
    setNotification,
    type Stage,
  } from './store.svelte';

  let stageIndex = $state(-1);
  let stage: Stage | undefined = $state(undefined);
  let deleting = $state(false);

  function editStage(index: number) {
    stageIndex = index;
    stage = getStages()[index];
    setCurrentCoordinates(stage.coordinates);
    setEditMode(true);
  }

  function closeForm() {
    setEditMode(false);
    stageIndex = -1;
    stage = undefined;
  }

  function _deleteStage(i: number) {
    deleting = true;
    deleteStage(i).then((success) => {
      deleting = false;
      setNotification({
        status: success ? 'SUCCESS' : 'FAILURE',
        message: success ? 'Stage deleted' : 'Error when deleting the stage',
      });
    });
  }
</script>

<div class="p-5 relative">
  {#if deleting}
    <OverlaySpinner></OverlaySpinner>
  {/if}
  {#if !isEditMode()}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
      {#each getStages() as stage, i}
        <div class="bg-white rounded overflow-hidden shadow-lg flex flex-col">
          <div class="relative">
            <a href={getStageUrl(i)}>
              {#if stage.pictures && stage.pictures.length > 0}
                <div class="w-full aspect-3/2 relative overflow-hidden">
                  <img
                    class="absolute w-full"
                    src={getPictureUrl(
                      getUser(),
                      getTripId(),
                      stage.pictures[0],
                    )}
                    alt={stage.pictures[0]}
                  />
                </div>
              {/if}
              <div
                class="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-slate-900 opacity-25"
              ></div>
            </a>
          </div>
          <div class="px-6 py-4 mb-auto">
            <div class="flex items-center content-center">
              <a
                href={getStageUrl(i)}
                onclick={() => goToStage(i)}
                class="font-medium text-lg hover:text-indigo-600 transition duration-500 ease-in-out inline-block mb-2"
              >
                {stage.title}
              </a>
            </div>
            <p class="text-gray-500 text-sm">
              {stage.description}
            </p>
          </div>
          <div
            class="px-6 py-3 flex flex-row items-center justify-between bg-slate-100"
          >
            <span class="py-1 text-xs font-regular text-gray-900 mr-auto"
              >{stage.date}</span
            >
            {#if getAuthUser()}
              <EditButton onclick={() => editStage(i)} />
              <DeleteButton onclick={() => _deleteStage(i)} />
            {/if}
          </div>
        </div>
      {/each}
    </div>
    <div class="flex flex-wrap gap-4 mt-3">
      {#if getAuthUser()}
        <button
          class="cursor-pointer text-white hover:text-indigo-600 text-sm bg-indigo-600 hover:bg-slate-100 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
          onclick={() => setEditMode(true)}
        >
          Add stage
        </button>
      {/if}
      <ShareButton></ShareButton>
    </div>
  {/if}
  {#if isEditMode()}
    <StageForm onclose={closeForm} {stage} {stageIndex}></StageForm>
  {/if}
</div>
