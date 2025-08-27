import type { Feature, FeatureCollection } from 'geojson';
import { getTripData } from './github';

export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token';

export interface Stage {
  coordinates: [number, number];
  title: string;
  pictures?: string[];
  description?: string;
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

export enum PAGE {
  Home,
  Trip,
}
let page: PAGE = $state(PAGE.Home);
export function setPage(_page: PAGE) {
  page = _page;
}
export function getPage(): PAGE {
  return page;
}

let trip: Trip = $state({
  title: '',
  stages: [],
});

export function setTrip(_trip: Trip) {
  trip = _trip;
}

let geometry: FeatureCollection = $derived.by(() => {
  const features: Feature[] = trip.stages.reduce((all, stage, index) => {
    if (index > 0) {
      const line: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [trip.stages[index - 1].coordinates, stage.coordinates],
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
  getTripData(user, tripId).then((trip: Trip) => setTrip(trip));
}
