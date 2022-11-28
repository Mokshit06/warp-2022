import mapboxgl from 'mapbox-gl';

const mapboxAccessToken =
  'pk.eyJ1IjoibW9rc2hpdDA2IiwiYSI6ImNrYW1qamMybDA0eW0yeXFvMnB5dW1sMmUifQ.T7tkxjaaE6hY6m4mV5GEpQ';

mapboxgl.accessToken = mapboxAccessToken;

export function formatGeocodeURL(location: string) {
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    location
  )}.json?access_token=${mapboxAccessToken}`;
}

export function formatDirectionsURL(origin: Coords, destination: Coords) {
  return `https://api.mapbox.com/directions/v5/mapbox/walking/${encodeURIComponent(
    `${origin.join(',')};${destination.join(',')}`
  )}?alternatives=true&geometries=geojson&steps=true&access_token=${mapboxAccessToken}`;
}

type Coords = [lon: number, lat: number];

export async function getDirections(from: Coords, to: Coords) {
  const res = await fetch(formatDirectionsURL(from, to));
  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as any).code);
  }

  return data;
}

export async function geocodeLocation(location: string): Promise<Coords> {
  const res = await fetch(formatGeocodeURL(location));
  const data = await res.json();

  return data.features[0].center;
}
