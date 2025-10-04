import type { Feature, FeatureCollection } from 'geojson';
import {
  deletePicture,
  deleteRepository,
  deleteTripData,
  loadTripData,
  storePicture,
  storeTripData,
} from './github';
import type { LatLng } from 'leaflet';

export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token';
export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
export const REDIRECT = import.meta.env.VITE_REDIRECT;

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
let authUser: string = $state('');
export function setAuthUser(_authUser: string) {
  authUser = _authUser;
}
export function getAuthUser(): string {
  return authUser;
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
  Delete,
}
let page: PAGE = $state(PAGE.Home);
export function setPage(_page: PAGE) {
  page = _page;
}
export function getPage(): PAGE {
  return page;
}

export interface Notification {
  status: 'SUCCESS' | 'FAILURE';
  message: string;
}
let notification: Notification | undefined = $state(undefined);
export function setNotification(_notification?: Notification) {
  notification = _notification;
  setTimeout(() => setNotification(), 3000);
}
export function getNotification(): Notification | undefined {
  return notification;
}

let stage: number = $state(-1);
export function setStage(_stage: number) {
  stage = _stage;
  page = PAGE.Stage;
}
export function getStage(): number {
  return stage;
}
let editMode: boolean = $state(false);
export function setEditMode(mode: boolean) {
  editMode = mode;
}
export function isEditMode(): boolean {
  return editMode;
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

export function addTripStage(
  stage: Stage,
  files: FileList | undefined,
): Promise<boolean> {
  stage.pictures = files ? Array.from(files).map((f) => f.name) : undefined;
  trip = { ...trip, stages: [...trip.stages, stage] };
  return storeTripData(authUser, tripId, trip).then(() => storeFiles(files));
}

export function deletePictureFromStage(
  stageIndex: number,
  picture: string,
): Promise<boolean> {
  trip = {
    ...trip,
    stages: trip.stages.map((stage, i) =>
      i === stageIndex
        ? {
            ...stage,
            pictures: (stage.pictures || []).filter((f) => f !== picture),
          }
        : { ...stage },
    ),
  };
  return deletePicture(authUser, tripId, picture).then(() =>
    storeTripData(authUser, tripId, trip),
  );
}

export function deleteStage(stageIndex: number): Promise<boolean> {
  const pictures = trip.stages[stageIndex].pictures || [];
  trip = {
    ...trip,
    stages: trip.stages.filter((stage, i) => i !== stageIndex),
  };
  return pictures
    .reduce(
      (all, pic) => all.then(() => deletePicture(authUser, tripId, pic)),
      Promise.resolve(true),
    )
    .then(() => storeTripData(authUser, tripId, trip));
}

export function updateStage(
  stageIndex: number,
  newStageData: Partial<Stage>,
  files: FileList | undefined,
): Promise<boolean> {
  const newPictures = files ? [...Array.from(files).map((f) => f.name)] : [];
  trip = {
    ...trip,
    stages: trip.stages.map((stage, i) =>
      i === stageIndex
        ? {
            ...stage,
            ...newStageData,
            pictures: [...(stage.pictures || []), ...newPictures],
          }
        : { ...stage },
    ),
  };
  return storeTripData(authUser, tripId, trip).then((success) =>
    storeFiles(files),
  );
}

export function deleteTrip(_tripId: string) {
  return loadTripData(authUser, _tripId).then((_trip: Trip) => {
    const pictures = (_trip.stages || []).reduce(
      (all, curr) => [...all, ...(curr.pictures || [])],
      [] as string[],
    );
    return pictures
      .reduce(
        (all, pic) => all.then(() => deletePicture(authUser, _tripId, pic)),
        Promise.resolve(true),
      )
      .then(() => deleteTripData(authUser, _tripId));
  });
}

export function deleteAllData() {
  return deleteRepository(authUser);
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
            [
              trip.stages[index - 1].coordinates.lng,
              trip.stages[index - 1].coordinates.lat,
            ],
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
  setUser(user);
  setTripId(tripId);
  loadTripData(user, tripId).then((_trip: Trip) => setTrip(_trip));
}

function storeFiles(files: FileList | undefined): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (files) {
      Array.from(files)
        .reduce(
          (all, f) =>
            all.then(
              () =>
                new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const b64 = (reader.result as string).split('base64,')[1];
                    storePicture(authUser, tripId, f.name, b64).then(
                      resolve,
                      reject,
                    );
                  };
                  reader.readAsDataURL(f);
                }),
            ),
          Promise.resolve(true),
        )
        .then(resolve, reject);
    } else {
      resolve(true);
    }
  });
}
