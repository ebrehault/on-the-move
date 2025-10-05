<script lang="ts">
  import ImagePlaceholder from './components/ImagePlaceholder.svelte';

  import { getPictureUrl, getThumbnailUrl } from './github';
  import { getTripId, getUser } from './store.svelte';

  let {
    classes = '',
    picture,
    thumbnail = false,
  }: { classes: string; picture: string; thumbnail: boolean } = $props();

  let notFound = $state(false);
  let pictureUrl = $state('');

  $effect(() => {
    if (thumbnail) {
      pictureUrl = getThumbnailUrl(getUser(), getTripId(), picture);
    } else {
      pictureUrl = getPictureUrl(getUser(), getTripId(), picture);
    }
    fetch(pictureUrl, { method: 'HEAD' }).then(
      (res) => (notFound = res.status === 404),
    );
  });
</script>

{#if notFound}
  <ImagePlaceholder label="Loading…"></ImagePlaceholder>
{:else}
  <img class={classes} alt={picture} src={pictureUrl} />
{/if}
