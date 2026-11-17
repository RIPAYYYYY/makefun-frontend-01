// make.fun's public API: read-only GET requests, open to any origin (CORS).
// The full API is described at https://make.fun/api/openapi.json.
//
// Performance: every response is kept in an ETag cache. A repeat request sends
// If-None-Match and reuses the cached body when the API answers 304, so going
// back to a view costs almost nothing. Requests for the same URL that are in
// flight at the same time share one fetch.

const API = 'https://make.fun/api';

const cache = new Map(); // url -> { etag, body }
const inflight = new Map(); // url -> Promise<body>

export function get(path) {
  const url = API + path;
  if (inflight.has(url)) return inflight.get(url);
  const hit = cache.get(url);
  const promise = (async () => {
    try {
      const headers = hit?.etag ? { 'If-None-Match': hit.etag } : {};
      const res = await fetch(url, { headers });
      if (res.status === 304 && hit) return hit.body;
      if (!res.ok) throw new Error(`make.fun API ${res.status} for ${path}`);
      const body = await res.json();
      const etag = res.headers.get('etag');
      if (etag) cache.set(url, { etag, body });
      return body;
    } finally {
      inflight.delete(url);
    }
  })();
  inflight.set(url, promise);
  return promise;
}

/** One page of the open bounties: { items, next_cursor }. Pass a cursor to continue. */
export const getBounties = (cursor) =>
  get(`/competitions?status=open&activity=times&limit=24${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);

/** One bounty in full, by its slug: summary, description, rules, rewards, live pot. */
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);

/** A bounty's leaderboard: { competition, phase, columns, entries }. */
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);

/** A public profile, by handle: bio, record and past entries. */
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);

/** The URL of a profile's avatar image (load it with crossorigin="anonymous"). */
export const avatarUrl = (handle) => `${API}/profiles/${encodeURIComponent(handle)}/picture.png`;
