const NASA_API_KEY = "5kFFKpxHv3WzpbAMFnPbOLLjxAfW9mg8Q6WSabVW";
const NASA_APOD_URL = "https://api.nasa.gov/planetary/apod";
const LAUNCHES_URL = "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";
const PLANETS_URL = "https://solar-system-opendata-proxy.vercel.app/api/planets";

async function requestJSON(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const abortExternalRequest = () => controller.abort();
  options.signal?.addEventListener("abort", abortExternalRequest, { once: true });

  let response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abortExternalRequest);
  }
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    const message = data?.error || data?.detail || `Request failed (${response.status}).`;
    throw new Error(message);
  }

  return data;
}

export function getApod(date, signal) {
  const params = new URLSearchParams({
    api_key: NASA_API_KEY,
    date,
  });

  return requestJSON(`${NASA_APOD_URL}?${params}`, { signal });
}

export async function getUpcomingLaunches(signal) {
  const data = await requestJSON(LAUNCHES_URL, { signal });

  if (!Array.isArray(data.results)) {
    throw new Error("Launches response has an unexpected format.");
  }

  return data.results;
}

export async function getPlanets(signal) {
  const data = await requestJSON(PLANETS_URL, { signal });

  if (!Array.isArray(data.bodies)) {
    throw new Error("Planets response has an unexpected format.");
  }

  return data.bodies;
}
