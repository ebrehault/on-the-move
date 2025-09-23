<script lang="ts">
  import {
    addTripStage,
    getCurrentCoordinates,
    setCurrentCoordinates,
    updateStage,
  } from './store.svelte';

  let { onclose, stage, stageIndex } = $props();
  let title = $state(stage?.title || '');
  let date = $state(stage?.date || '');
  let description = $state(stage?.description || '');
  let files: FileList | undefined = $state();
  let invalidForm = $derived(!getCurrentCoordinates() || !title);

  function save(e: Event) {
    e.preventDefault();
    const coordinates = getCurrentCoordinates();
    if (coordinates) {
      if (!stage) {
        addTripStage(
          {
            title,
            description,
            date,
            coordinates,
          },
          files,
        ).then(() => {
          setCurrentCoordinates(undefined);
          onclose();
        });
      } else {
        updateStage(stageIndex, { title, description, date }).then(() => {
          setCurrentCoordinates(undefined);
          onclose();
        });
      }
    }
  }

  function closeForm(e: Event) {
    e.preventDefault();
    onclose();
  }
</script>

<div class="max-w-150">
  <h1 class="text-2xl font-semibold mb-4 text-gray-800">
    {#if !stage}
      Add a new stage
    {:else}
      Edit the stage
    {/if}
  </h1>
  <form>
    {#if !getCurrentCoordinates()}
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700"
          >Select a position by clicking on the map</label
        >
      </div>
    {/if}
    <div class="mb-4">
      <label for="title" class="block text-sm font-medium text-gray-700">
        Title
      </label>
      <input
        bind:value={title}
        type="text"
        id="title"
        name="title"
        placeholder="Enter a title"
        class="mt-1 block w-full p-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        required
      />
    </div>
    <div class="mb-4">
      <label for="date" class="block text-sm font-medium text-gray-700">
        Date
      </label>
      <input
        bind:value={date}
        type="date"
        id="date"
        name="date"
        class="mt-1 block w-full p-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
      />
    </div>
    <div class="mb-4">
      <label for="description" class="block text-sm font-medium text-gray-700">
        Description
      </label>
      <textarea
        bind:value={description}
        id="description"
        name="description"
        class="mt-1 block w-full p-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
      />
    </div>

    {#if !stage}
      <div
        class="rounded-lg border border-blue-600 bg-slate-100 p-4 shadow-md w-36"
      >
        <label
          for="upload"
          class="flex flex-col items-center gap-2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 fill-white stroke-blue-600"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span class="text-gray-600 font-medium">Pictures</span>
        </label>
        <input
          class="hidden"
          id="upload"
          type="file"
          multiple
          bind:files
          accept="image/*"
        />
      </div>
      {#if files}
        <ul class="flex flex-col gap-3.5 w-full sm:max-w-md">
          {#each Array.from(files) as file}
            <li class="w-full bg-slate-100 p-3 rounded-md">{file.name}</li>
          {/each}
        </ul>
      {/if}
    {/if}
    <div class="flex flex-wrap gap-4 mt-3">
      <button
        class="text-white text-sm bg-indigo-600 hover:not-disabled:bg-indigo-800 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center disabled:opacity-25"
        class:cursor-pointer={!invalidForm}
        onclick={save}
        disabled={invalidForm}
      >
        Save
      </button>
      <button
        class="ml-auto cursor-pointer text-indigo-800 hover:text-indigo-600 text-sm bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
        onclick={closeForm}
      >
        Close
      </button>
    </div>
  </form>
</div>
