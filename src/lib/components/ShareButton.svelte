<script lang="ts">
  import { setNotification } from '../store.svelte';
  let { text = '' } = $props();

  function copyUrl() {
    let post = location.href;
    if (text) {
      post = `${text}\n\n${post}`;
    }
    navigator.clipboard.writeText(post);
    setNotification({ status: 'SUCCESS', message: 'Copied' });
  }
</script>

<button
  class="cursor-pointer text-indigo-800 hover:text-indigo-600 text-sm bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
  onclick={copyUrl}
>
  {#if text}
    Share the text and the page
  {:else}
    Share the page
  {/if}
</button>
