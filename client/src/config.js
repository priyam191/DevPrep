// Backend API base URL.
//   Local dev  (client/.env):            http://localhost:3001
//     The CRA dev server does not proxy, so the API is called cross-origin.
//   Production (client/.env.production): https://devprep-api.duckdns.org
//     The React app (Vercel) and the Express API (duckdns) are deployed
//     separately, so production calls the API cross-origin by its absolute URL.
const API_URL = process.env.REACT_APP_API_URL || 'localhost:3001';

export default API_URL;
