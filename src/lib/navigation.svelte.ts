import {
  getTripId,
  getUser,
  loadTrip,
  PAGE,
  setCurrentCoordinates,
  setPage,
  setStage,
} from './store.svelte';

export function parseHash() {
  if (location.hash === '#DELETE') {
    setPage(PAGE.Delete);
  } else {
    const params = location.hash.split('/');
    if (params.length >= 3) {
      const user = params[1];
      const trip = params[2];
      if (user !== getUser() || trip !== getTripId()) {
        loadTrip(user, trip);
      }
      if (params.length === 3) {
        setPage(PAGE.Trip);
        setCurrentCoordinates(undefined);
      } else {
        let stage = parseInt(params[3], 10);
        stage = isNaN(stage) ? -1 : stage;
        setStage(stage);
      }
    } else {
      setPage(PAGE.Home);
    }
  }
}

export function getTripUrl() {
  return `#/${getUser()}/${getTripId()}`;
}
export function goToTrip() {
  location.hash = getTripUrl();
}
export function getStageUrl(stageIndex: number) {
  return `#/${getUser()}/${getTripId()}/${stageIndex}`;
}
export function goToStage(stageIndex: number) {
  location.hash = getStageUrl(stageIndex);
}
