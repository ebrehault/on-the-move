export const ACCESS_TOKEN_STORAGE_KEY = 'GITHUB_TOKEN';
const DATA_REPOSITORY = 'on-the-move-data';

export function getCurrentUser(): Promise<string> {
  return fetchAPI('/user').then((data) => data.login as string);
}

export function getTripData(user: string, tripId: string) {
  if (!getToken()) {
    return fetch(`https://raw.githubusercontent.com/${user}/on-the-move-data/refs/heads/main/${tripId}/trip.json`).then(
      (res) => res.json(),
    );
  } else {
    // raw urls have cache, so when authenticated, use the API
    return fetchAPI(`/repos/${user}/on-the-move-data/contents/${tripId}/trip.json`).then((res) =>
      JSON.parse(atob(res.content)),
    );
  }
}

export function createRepository() {
  return fetchAPI('/user/repos', 'POST', { name: DATA_REPOSITORY, public: true });
}

export function hasRepository(user: string) {
  return fetchAPI(`/repos/${user}/on-the-move-data`).then((res) => res.status !== '404');
}

export function getTripsList(user: string) {
  return fetchAPI(`/repos/${user}/on-the-move-data/contents`).then((res: any) => {
    if (res.status !== '404') {
      const folders = res as any[];
      return (folders || []).map((f) => f.name);
    } else {
      return [];
    }
  });
}

export function createTrip(user: string, tripName: string) {
  const tripId = encodeURIComponent(tripName);
  return hasRepository(user)
    .then((hasRepo) => (hasRepo ? true : createRepository()))
    .then(() => setTripData(user, tripId, { title: tripName, stages: [] }))
    .then(() => tripId);
}

export function setTripData(user: string, tripId: string, tripData: any) {
  const data: any = { message: 'change trip', content: btoa(JSON.stringify(tripData)) };
  return fetchAPI(`/repos/${user}/on-the-move-data/contents/${tripId}/trip.json`).then((res) => {
    if (res.status !== '404') {
      data.sha = res.sha;
    }
    return fetchAPI(`/repos/${user}/on-the-move-data/contents/${tripId}/trip.json`, 'PUT', data);
  });
}

function fetchAPI<T = any>(path: string, method = 'GET', body?: any): Promise<T> {
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
  return fetch(`https://api.github.com${path}`, params).then((res) => res.json() as T);
}

function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}
