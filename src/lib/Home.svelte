<script lang="ts">
  import DeleteButton from './components/DeleteButton.svelte';
  import { createTrip, getTripsList, hasRepository } from './github';
  import { CLIENT_ID, REDIRECT, getAuthUser, loadTrip, PAGE, setPage, deleteTrip } from './store.svelte';

  let trips: string[] = $state([]);
  let tripName = $state('');
  let hasRepo = $state(false);

  $effect(() => {
    const user = getAuthUser();
    if (user) {
      getTripsList(user).then((_trips) => {
        if (_trips) {
          trips = _trips;
        }
      });
    }
  });

  function showTrip(trip: string) {
    loadTrip(getAuthUser(), trip);
    setPage(PAGE.Trip);
  }

  function addTrip(event: Event) {
    event.preventDefault();
    const user = getAuthUser();
    if (user) {
      createTrip(user, tripName).then((tripId) => showTrip(tripId));
    }
  }

  $effect(() => {
    if (getAuthUser()) {
      hasRepository(getAuthUser()).then((has) => (hasRepo = has));
    }
  });
</script>

<div class="p-4">
  <h1 class="text-3xl font-bold">On the move</h1>
  {#if !getAuthUser()}
    <p class="mt-2">To create a trip, you need to login.</p>
  {:else}
    {#if trips.length === 0}
      <h2 class="text-xl font-bold mt-2">Create your first trip</h2>
    {:else}
      <h2 class="text-xl font-bold mt-2">Your trips</h2>
      <ul class="bg-white rounded-lg shadow divide-y divide-gray-200 max-w-sm">
        {#each trips as trip}
          <li class="px-6 py-4">
            <div class="flex justify-between">
              <span class="font-semibold text-lg">
                <a
                  href={`#/${getAuthUser()}/${trip}`}
                  onclick={() => showTrip(trip)}
                >
                  {trip}
                </a>
              </span>
              <DeleteButton onclick={() => deleteTrip(trip)}></DeleteButton>
            </div>
          </li>
        {/each}
      </ul>
      <h2 class="text-xl font-bold mt-2">Add a new trip</h2>
    {/if}
    <form>
      <div class="mb-4">
        <label
          for="tripName"
          class="block text-sm font-medium text-gray-700"
        >
          Name of the trip
        </label>
        <input
          bind:value={tripName}
          type="text"
          id="tripName"
          name="tripName"
          placeholder="Enter a name for your trip"
          class="mt-1 block w-full p-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          required
        />
        <button
          class="mt-2 text-white hover:text-blue-600 text-sm bg-blue-600 hover:bg-gray-100 rounded-lg font-medium px-4 py-2 inline-flex space-x-1 items-center disabled:opacity-25"
          onclick={addTrip}
        >
          Create
        </button>
      </div>
    </form>
    <h2 class="text-xl font-bold mt-2">About</h2>
    <p class="mt-2">
      On-The-Move is a web application designed for <strong>travelers who want to share their journey</strong>
      . It allows them to post the different stages of their trip, including their location and photos.
    </p>
    <p class="mt-2">
      It is dedicated to travelers who choose <strong>eco-friendly means of transportation</strong>
      (but anyone can use it; it is free and open source, and it does not collect any user data or track users).
    </p>
    <p class="mt-2">
      We believe it is important to share your eco-friendly travel experiences, as this is a good way to multiply the
      positive impact of your eco-friendly choice. When you spend 3 days on a train instead of 2 hours on a plane, you
      already significantly reduce your carbon emissions (1 ton, in fact), but this impact can be multiplied if it
      encourages others to do the same.
    </p>
    <p class="mt-2">
      When they see your daily posts on On-The-Move, your friends and family may go from thinking, <i>
        “That's crazy, why would I do that?”
      </i>
      to
      <i>“Hey, that actually sounds like fun!”</i>
      .
    </p>
    <p class="mt-2">They may not do it right away, but at least the seed will have been planted, and it will grow.</p>
    <p class="mt-2"><strong>So go inspire people! And have a nice trip :)</strong></p>
    {#if hasRepo}
      <h2 class="text-xl font-bold mt-2">Delete your data</h2>
      <div>
        If you want to delete all your data stored in this application, you need to <a
          class="underline"
          href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=public_repo,user,delete_repo&redirect_uri=https://auth.abfab.dev/github-callback?destination=${REDIRECT}/#DELETE`}
        >
          re-authenticate to GitHub with administrator access rights.
        </a>
      </div>
    {/if}
  {/if}
</div>
