export const ACCESS_TOKEN_STORAGE_KEY = 'GITHUB_TOKEN';
export const THUMBNAIL_POSTFIX = 'thumbnail.jpg';
const DATA_REPOSITORY = 'on-the-move-data';

export function getCurrentAuthUser(): Promise<string> {
  return fetchAPI('/user').then((data) => data.login as string);
}

export function loadTripData(user: string, tripId: string) {
  if (!getToken()) {
    return fetch(
      `https://raw.githubusercontent.com/${user}/${DATA_REPOSITORY}/refs/heads/main/${tripId}/trip.json`,
    )
      .then((res) => res.text())
      .then((s) => (s ? JSON.parse(s) : {}));
  } else {
    // raw urls have cache, so when authenticated, use the API
    return fetchAPI(
      `/repos/${user}/${DATA_REPOSITORY}/contents/${tripId}/trip.json`,
    ).then((res) => {
      debugger;
      return res.status !== '404' && res.content
        ? JSON.parse(b64DecodeUnicode(res.content))
        : {};
    });
  }
}

export function createRepository() {
  return fetchAPI('/user/repos', 'POST', {
    name: DATA_REPOSITORY,
    public: true,
  });
}

export function deleteRepository(user: string) {
  return fetchAPI(`/repos/${user}/${DATA_REPOSITORY}`, 'DELETE');
}

export function hasRepository(user: string) {
  return fetchAPI(`/repos/${user}/${DATA_REPOSITORY}`).then(
    (res) => res.status !== '404',
  );
}

export function getTripsList(user: string) {
  return fetchAPI(`/repos/${user}/${DATA_REPOSITORY}/contents`).then(
    (res: any) => {
      if (res.status !== '404') {
        const folders = res as any[];
        return (folders || []).map((f) => f.name);
      } else {
        return [];
      }
    },
  );
}

export function createTrip(user: string, tripName: string) {
  const tripId = tripName.replace(new RegExp(/[^a-zA-Z0-9-]/g), '-');
  return hasRepository(user)
    .then((hasRepo) => (hasRepo ? true : createRepository()))
    .then(() => storeTripData(user, tripId, { title: tripName, stages: [] }))
    .then(() => tripId);
}

export function storeTripData(user: string, tripId: string, tripData: any) {
  const data: any = {
    message: 'change trip',
    content: b64EncodeUnicode(JSON.stringify(tripData)),
  };
  return fetchAPI(
    `/repos/${user}/${DATA_REPOSITORY}/contents/${tripId}/trip.json`,
  ).then((res) => {
    if (res.status !== '404') {
      data.sha = res.sha;
    }
    return fetchAPI(
      `/repos/${user}/${DATA_REPOSITORY}/contents/${tripId}/trip.json`,
      'PUT',
      data,
    ).then((res) => {
      if (!res.status || res.status.startsWith('2')) {
        return true;
      } else {
        return false;
      }
    });
  });
}

export function getThumbnailUrl(
  user: string,
  tripId: string,
  filename: string,
) {
  return `${getPictureUrl(user, tripId, filename)}.${THUMBNAIL_POSTFIX}`;
}

export function getPictureUrl(user: string, tripId: string, filename: string) {
  return `https://raw.githubusercontent.com/${user}/${DATA_REPOSITORY}/refs/heads/main/${tripId}/${filename}`;
}

export function storePicture(
  user: string,
  tripId: string,
  filename: string,
  objectURL: string,
) {
  const b64image = objectURL.split('base64,')[1];
  const data: any = { message: `add ${filename}`, content: b64image };
  return fetchAPI(
    `/repos/${user}/${DATA_REPOSITORY}/contents/${tripId}/${filename}`,
    'PUT',
    data,
  ).then((res) => {
    if (!res.status || res.status.startsWith('2')) {
      return true;
    } else {
      return false;
    }
  });
}

export function deleteTripData(user: string, tripId: string) {
  return deleteFile(user, `${tripId}/trip.json`);
}

export function deletePicture(user: string, tripId: string, filename: string) {
  const path = `${tripId}/${filename}`;
  return deleteFile(user, path).then(() =>
    deleteFile(user, `${path}.${THUMBNAIL_POSTFIX}`),
  );
}

function deleteFile(user: string, filepath: string) {
  const path = `/repos/${user}/${DATA_REPOSITORY}/contents/${filepath}`;
  return fetchAPI(path).then((res) =>
    fetchAPI(path, 'DELETE', { sha: res.sha, message: `Delete ${filepath}` }),
  );
}

function fetchAPI<T = any>(
  path: string,
  method = 'GET',
  body?: any,
): Promise<T> {
  const token = getToken();
  if (!token) {
    throw 'NOT AUTHENTICATED';
  }
  const params = {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  };
  return fetch(`https://api.github.com${path}`, params).then(
    (res) => res.json() as T,
  );
}

function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function removeToken() {
  return localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

function b64EncodeUnicode(str: string) {
  // first we use encodeURIComponent to get percent-encoded Unicode,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(
    encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        const v = '0x' + p1;
        return String.fromCharCode(v as any as number);
      },
    ),
  );
}

function b64DecodeUnicode(str: string) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}
