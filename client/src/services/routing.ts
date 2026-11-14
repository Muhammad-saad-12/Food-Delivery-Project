export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng]
  distanceKm: number;
  durationMin: number;
  summary?: string;
  source: 'osrm' | 'interpolated';
}

/**
 * Fetch real turn-by-turn road route from OSRM with smart interpolation fallback.
 * @param start [lat, lng] origin
 * @param end [lat, lng] destination
 */
export async function fetchRoadRoute(
  start: [number, number],
  end: [number, number]
): Promise<RouteResult> {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // OSRM expects coordinates as: {lng},{lat};{lng},{lat}
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // GeoJSON coordinates are [lng, lat], convert to Leaflet [lat, lng]
        const leafletCoords: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        const distanceKm = Number((route.distance / 1000).toFixed(1));
        const durationMin = Math.max(1, Math.round(route.duration / 60));

        return {
          coordinates: leafletCoords,
          distanceKm,
          durationMin,
          summary: route.legs?.[0]?.summary || 'Primary Road Route',
          source: 'osrm',
        };
      }
    }
  } catch (err) {
    console.warn('OSRM public service unreachable, falling back to simulated road path:', err);
  }

  // Fallback: Generate realistic multi-segment curved street path
  const numSteps = 20;
  const coords: [number, number][] = [];

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    // Straight interpolation
    let lat = startLat + (endLat - startLat) * t;
    let lng = startLng + (endLng - startLng) * t;

    // Add gentle road curves (simulate city avenues)
    const sinOffset = Math.sin(t * Math.PI) * 0.0035;
    lat += sinOffset * 0.5;
    lng += sinOffset;

    coords.push([lat, lng]);
  }

  // Haversine distance estimation
  const R = 6371; // Earth radius in km
  const dLat = ((endLat - startLat) * Math.PI) / 180;
  const dLng = ((endLng - startLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((startLat * Math.PI) / 180) *
      Math.cos((endLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Number((R * c * 1.3).toFixed(1)); // 1.3 road factor
  const durationMin = Math.max(2, Math.round(distanceKm * 2.5)); // ~25 km/h city motorbike speed

  return {
    coordinates: coords,
    distanceKm,
    durationMin,
    summary: 'City Arterial Corridor',
    source: 'interpolated',
  };
}
