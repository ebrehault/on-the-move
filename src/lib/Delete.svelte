<script lang="ts">
  import { deleteAllData } from './store.svelte';
</script>

<h1>Good bye</h1>
<div>
  Delete all your trip data stored in GitHub <button onclick={deleteAllData}
    >DELETE</button
  >
</div>
<div>
  Once done, you might want to <a
    href="https://github.com/settings/admin"
    target="_new"
  >
    delete your GitHub account
  </a>
  if you created it only to use this application.
</div>
