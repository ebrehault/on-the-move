<script lang="ts">
  import {
    getNextStageUrl,
    getPreviousStageUrl,
    getTripUrl,
    hasNextStage,
    hasPreviousStage,
  } from '../navigation.svelte';

  let tripUrl = getTripUrl();
</script>

<div>
  <a
    href={tripUrl}
    aria-label="Up"
    class="cursor-pointer text-white inline-flex space-x-1 items-cente bg-indigo-900 border border-indigo-900 rounded hover:border-white focus:outline-none focus:ring p-1"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      class="h-6 w-6"
    >
      <path
        transform="rotate(90, 12, 12)"
        id="svg_1"
        d="m7,16l-4,-4m0,0l4,-4m-4,4l18,0"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  </a>
  <a
    href={getPreviousStageUrl()}
    aria-label="Previous"
    class:cursor-pointer={hasPreviousStage()}
    class:pointer-events-none={!hasPreviousStage()}
    class="inline-flex space-x-1 items-cente bg-indigo-900 border border-indigo-900 rounded hover:border-white focus:outline-none focus:ring p-1"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke={hasPreviousStage() ? 'currentColor' : 'grey'}
      class="h-6 w-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 16l-4-4m0 0l4-4m-4 4h18"
      >
      </path></svg
    >
  </a>
  <a
    href={getNextStageUrl()}
    aria-label="Next"
    class:cursor-pointer={hasNextStage()}
    class:pointer-events-none={!hasNextStage()}
    class="inline-flex space-x-1 items-cente bg-indigo-900 border border-indigo-900 rounded hover:border-white focus:outline-none focus:ring p-1"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke={hasNextStage() ? 'currentColor' : 'grey'}
      class="h-6 w-6"
    >
      <path
        transform="rotate(180, 12, 12)"
        id="svg_1"
        d="m7,16l-4,-4m0,0l4,-4m-4,4l18,0"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  </a>
</div>
