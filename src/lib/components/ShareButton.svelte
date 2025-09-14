<script lang="ts">
  function copyUrl() {
    navigator.clipboard.writeText(location.href);
  }
</script>

<button
  class="cursor-pointer text-slate-800 hover:text-blue-600 text-sm bg-gray-100 hover:bg-white rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center"
  onclick={copyUrl}
>
  Copy to share URL
</button>
