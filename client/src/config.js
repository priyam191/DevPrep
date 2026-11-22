// Backend API base URL.
//   Local dev  (client/.env):            http://localhost:3001
//     The CRA dev server does not proxy, so the API is called cross-origin.
//   Production (client/.env.production): empty
//     The React app and the Express API are served from the same Vercel domain
//     (routing is defined in the repo-root vercel.json), so an empty value
//     intentionally produces same-origin relative URLs (/api/...).
const API_URL = process.env.REACT_APP_API_URL || '';

export default API_URL;
