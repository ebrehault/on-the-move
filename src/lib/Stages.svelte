<script lang="ts">
  import { getStages } from './store.svelte';
</script>

<ul>
  {#each getStages() as stage}
    <li>{stage.title}</li>
  {/each}
</ul>
