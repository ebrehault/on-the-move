import type { Feature, FeatureCollection } from 'geojson';
import { loadTripData } from './github';
import type { LatLng } from 'leaflet';

export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token';

export interface Stage {
  coordinates: LatLng;
  title: string;
  pictures?: string[];
  description?: string;
  date: string;
}

export interface Trip {
  title: string;
  stages: Stage[];
}

let user: string = $state('');
export function setUser(_user: string) {
  user = _user;
}
export function getUser(): string {
  return user;
}
let tripId: string = $state('');
export function setTripId(_tripId: string) {
  tripId = _tripId;
}
export function getTripId(): string {
  return tripId;
}

export enum PAGE {
  Home,
  Trip,
  Stage,
}
let page: PAGE = $state(PAGE.Home);
export function setPage(_page: PAGE) {
  page = _page;
}
export function getPage(): PAGE {
  return page;
}

let stage: number = $state(-1);
export function setStage(_stage: number) {
  stage = _stage;
  page = PAGE.Stage;
}
export function getStage(): number {
  return stage;
}

let currentCoordinates: LatLng | undefined = $state(undefined);
export function setCurrentCoordinates(_currentCoordinates: LatLng | undefined) {
  currentCoordinates = _currentCoordinates;
}
export function getCurrentCoordinates(): LatLng | undefined {
  return currentCoordinates;
}

let trip: Trip = $state({
  title: '',
  stages: [],
});

export function setTrip(_trip: Trip) {
  trip = _trip;
}
export function getTrip(): Trip {
  return trip;
}
export function addTripStage(stage: Stage) {
  trip = { ...trip, stages: [...trip.stages, stage] };
}

let geometry: FeatureCollection = $derived.by(() => {
  const features: Feature[] = trip.stages.reduce((all, stage, index) => {
    if (index > 0) {
      const line: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [trip.stages[index - 1].coordinates.lng, trip.stages[index - 1].coordinates.lat],
            [stage.coordinates.lng, stage.coordinates.lat],
          ],
        },
      };
      all.push(line);
    }
    return all;
  }, [] as Feature[]);
  return { type: 'FeatureCollection', features };
});
export function getGeometry(): FeatureCollection {
  return geometry;
}

let stages: Stage[] = $derived(trip.stages);
export function getStages(): Stage[] {
  return stages;
}

export function loadTrip(user: string, tripId: string) {
  setTripId(tripId);
  loadTripData(user, tripId).then((trip: Trip) => setTrip(trip));
}
