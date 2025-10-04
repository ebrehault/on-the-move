<script lang="ts">
  import { getTripUrl } from '../navigation.svelte';
</script>

<a
  href={getTripUrl()}
  aria-label="Delete"
  class="cursor-pointer inline-flex space-x-1 items-center text-white bg-indigo-900 border border-indigo-900 rounded hover:border-white focus:outline-none focus:ring p-1"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    class="h-6 w-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M7 16l-4-4m0 0l4-4m-4 4h18"
    >
    </path>
  </svg>
  <span class="ml-1 font-bold text-sm">Back</span>
</a>
