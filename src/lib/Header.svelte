<script lang="ts">
  import { getNotification } from './store.svelte';

  let status = $derived(getNotification()?.status);
  let message = $derived(getNotification()?.message);
</script>

<header
  class="sticky top-0 left-0 right-0 z-1 bg-indigo-900 text-white h-15 flex items-center px-4"
>
  <h1 class="text-3xl">On the move</h1>
  <div class="ml-auto flex">
    {#if message}
      {#if status === 'SUCCESS'}
        <svg viewBox="0 0 24 24" class="text-white w-5 h-5 sm:w-5 sm:h-5 mr-3">
          <path
            fill="currentColor"
            d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
          >
          </path>
        </svg>
      {/if}
      {#if status === 'FAILURE'}
        <svg viewBox="0 0 24 24" class="text-white w-5 h-5 sm:w-5 sm:h-5 mr-3">
          <path
            fill="currentColor"
            d="M23.119,20,13.772,2.15h0a2,2,0,0,0-3.543,0L.881,20a2,2,0,0,0,1.772,2.928H21.347A2,2,0,0,0,23.119,20ZM11,8.423a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Zm1.05,11.51h-.028a1.528,1.528,0,0,1-1.522-1.47,1.476,1.476,0,0,1,1.448-1.53h.028A1.527,1.527,0,0,1,13.5,18.4,1.475,1.475,0,0,1,12.05,19.933Z"
          >
          </path>
        </svg>
      {/if}
      {message}
    {/if}
  </div>
</header>
