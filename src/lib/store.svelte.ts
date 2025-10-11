import type { Feature, FeatureCollection } from 'geojson';
import {
  deletePicture,
  deleteRepository,
  deleteTripData,
  loadTripData,
  storePicture,
  storeTripData,
  THUMBNAIL_POSTFIX,
} from './github';
import type { LatLng } from 'leaflet';
import { getImageGPSPosition } from './image';

export const TOCTOCTOC_ACCESS_TOKEN_URL_PARAMETER = 'access_token';
export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
export const REDIRECT = import.meta.env.VITE_REDIRECT;

export interface Stage {
  coordinates: LatLng;
  title: string;
  pictures?: string[];
  picture_coordinates?: { [picture: string]: LatLng };
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
export function isOwner(): boolean {
  return authUser === user;
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
  page = _stage === -1 ? PAGE.Trip : PAGE.Stage;
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
  return collectPictureData(files).then((data) => {
    stage.pictures =
      data?.pictures && data.pictures.length > 0 ? data.pictures : undefined;
    stage.picture_coordinates =
      data?.picture_coordinates &&
      Object.keys(data.picture_coordinates).length > 0
        ? data.picture_coordinates
        : undefined;
    trip = { ...trip, stages: [...trip.stages, stage] };
    return storeTripData(authUser, tripId, trip).then(() => storeFiles(files));
  });
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
            picture_coordinates: {
              ...(stage.picture_coordinates || {}),
              [picture]: undefined,
            },
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
  return collectPictureData(files)
    .then((data) => {
      const newPictures =
        data?.pictures && data.pictures.length > 0 ? data.pictures : [];
      const newPicturesCoord =
        data?.picture_coordinates &&
        Object.keys(data.picture_coordinates).length > 0
          ? data.picture_coordinates
          : {};
      trip = {
        ...trip,
        stages: trip.stages.map((stage, i) =>
          i === stageIndex
            ? {
                ...stage,
                ...newStageData,
                pictures: [...(stage.pictures || []), ...newPictures],
                picture_coordinates: {
                  ...(stage.picture_coordinates || {}),
                  ...newPicturesCoord,
                },
              }
            : { ...stage },
        ),
      };
      return storeTripData(authUser, tripId, trip);
    })
    .then((success) => storeFiles(files));
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

let stageGeometry: FeatureCollection | undefined = $derived.by(() => {
  if (
    stage !== -1 &&
    trip.stages[stage] &&
    trip.stages[stage].picture_coordinates
  ) {
    const features: Feature[] = Object.entries(
      trip.stages[stage].picture_coordinates || {},
    ).reduce((all, [picture, coord]) => {
      const point: Feature = {
        type: 'Feature',
        properties: {
          picture,
        },
        geometry: {
          type: 'Point',
          coordinates: [coord.lng, coord.lat],
        },
      };
      all.push(point);
      return all;
    }, [] as Feature[]);
    return { type: 'FeatureCollection', features };
  } else {
    return undefined;
  }
});
export function getStageGeometry(): FeatureCollection | undefined {
  return stageGeometry;
}

let _currentPicture = $state('');
export function setCurrentPicture(picture: string) {
  _currentPicture = picture;
}
export function getCurrentPicture() {
  return _currentPicture;
}

export function loadTrip(user: string, tripId: string) {
  setUser(user);
  setTripId(tripId);
  loadTripData(user, tripId).then((_trip: Trip) => setTrip(_trip));
}

export function fileToObjectURL(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const objectURL = reader.result as string;
      resolve(objectURL);
    };
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });
}

function storeFiles(files: FileList | undefined): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (files) {
      Array.from(files)
        .reduce(
          (all, f) =>
            all
              .then(() => fileToObjectURL(f))
              .then((objectURL) =>
                storePicture(authUser, tripId, f.name, objectURL)
                  .then(() => resizeImage(objectURL))
                  .then((thumbnail) =>
                    storePicture(
                      authUser,
                      tripId,
                      `${f.name}.${THUMBNAIL_POSTFIX}`,
                      thumbnail,
                    ),
                  ),
              ),
          Promise.resolve(true),
        )
        .then(resolve, reject);
    } else {
      resolve(true);
    }
  });
}

export function resizeImage(objectURL: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const ratio = Math.min(500 / img.width, 500 / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      canvas.width = newWidth;
      canvas.height = newHeight;
      if (!ctx) {
        reject();
      } else {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(canvas.toDataURL('image/jpeg'));
      }
    };
    img.src = objectURL;
  });
}

function collectPictureData(files: FileList | undefined) {
  if (!files) {
    return Promise.resolve();
  }
  const pictures: string[] = [];
  const picture_coordinates: { [picture: string]: LatLng } = {};
  return Array.from(files)
    .reduce(
      (all, file) =>
        all.then(() => {
          const name = file.name;
          pictures.push(name);
          // return getImageGPSPosition(file).then((coord) => {
          //   if (coord) {
          //     picture_coordinates[name] = coord;
          //   }
          // });
          // broken on phone, disable temporarily
          return Promise.resolve();
        }),
      Promise.resolve(),
    )
    .then(() => ({ pictures, picture_coordinates }));
}
