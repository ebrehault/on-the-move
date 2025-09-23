<script lang="ts">
  function copyUrl() {
    navigator.clipboard.writeText(location.href);
  }
</script>

<button
  class="cursor-pointer text-indigo-800 hover:text-indigo-600 text-sm bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
  onclick={copyUrl}
>
  Copy URL to share
</button>
