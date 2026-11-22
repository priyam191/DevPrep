// Backend API base URL, set per environment via REACT_APP_API_URL:
//   Local dev:  client/.env             -> http://localhost:3001
//   Production: client/.env.production  -> https://devprep-api.duckdns.org
const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  throw new Error(
    'REACT_APP_API_URL is not defined. Set it in client/.env (local) or your deployment environment.'
  );
}

export default API_URL;
