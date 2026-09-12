const https = require('https');

// Simple in-memory cache for road routes (key: source->dest, TTL: 1 hour)
const routeCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Helper to fetch data with a timeout
 */
function httpsGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: rawData,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(options.timeout || 7000, () => {
      req.destroy(new Error('OSRM routing request timed out'));
    });
  });
}

/**
 * GET /api/routes/route?sourceLat=...&sourceLng=...&destinationLat=...&destinationLng=...
 * Calculates driving route using Open Source Routing Machine (OSRM)
 */
async function getDrivingRoute(req, res) {
  try {
    const { sourceLat, sourceLng, destinationLat, destinationLng } = req.query;

    const sLat = parseFloat(sourceLat);
    const sLng = parseFloat(sourceLng);
    const dLat = parseFloat(destinationLat);
    const dLng = parseFloat(destinationLng);

    // Validate coordinate ranges
    if (
      isNaN(sLat) || sLat < -90 || sLat > 90 ||
      isNaN(sLng) || sLng < -180 || sLng > 180 ||
      isNaN(dLat) || dLat < -90 || dLat > 90 ||
      isNaN(dLng) || dLng < -180 || dLng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinate parameters. Latitude must be between -90 and 90, Longitude between -180 and 180.',
      });
    }

    // Check memory cache
    const cacheKey = `${sLat.toFixed(5)},${sLng.toFixed(5)};${dLat.toFixed(5)},${dLng.toFixed(5)}`;
    const cached = routeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({
        ...cached.data,
        fromCache: true,
      });
    }

    // OSRM URL rule: {sourceLng},{sourceLat};{destinationLng},{destinationLat}
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${dLng},${dLat}?overview=full&geometries=geojson&steps=true&alternatives=false`;

    const response = await httpsGet(osrmUrl, {
      headers: {
        'User-Agent': 'CarbonCycle-GIS/1.0 (Hackathon Circular Logistics Platform)',
        Accept: 'application/json',
      },
      timeout: 6000,
    });

    if (response.statusCode !== 200) {
      console.warn(`[OSRM Routing] HTTP ${response.statusCode} returned by OSRM`);
      return res.status(502).json({
        success: false,
        message: `OSRM routing service returned HTTP ${response.statusCode}`,
        isFallback: true,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(response.data);
    } catch (parseErr) {
      return res.status(502).json({
        success: false,
        message: 'Failed to parse OSRM response JSON',
        isFallback: true,
      });
    }

    if (parsed.code !== 'Ok' || !parsed.routes || parsed.routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: parsed.message || 'No road route found between the specified coordinates',
        code: parsed.code || 'NoRoute',
        isFallback: true,
      });
    }

    const primaryRoute = parsed.routes[0];
    const distanceMeters = Math.round(primaryRoute.distance);
    const distanceKm = Number((primaryRoute.distance / 1000).toFixed(1));
    const durationSeconds = Math.round(primaryRoute.duration);
    const durationMinutes = Math.max(1, Math.round(primaryRoute.duration / 60));

    const responsePayload = {
      success: true,
      distanceMeters,
      distanceKm,
      durationSeconds,
      durationMinutes,
      geometry: primaryRoute.geometry, // GeoJSON LineString: { type: 'LineString', coordinates: [[lng, lat], ...] }
      steps: (primaryRoute.legs && primaryRoute.legs[0] && primaryRoute.legs[0].steps) || [],
      isFallback: false,
    };

    // Cache successful response
    routeCache.set(cacheKey, {
      timestamp: Date.now(),
      data: responsePayload,
    });

    // Prune cache if oversized (> 500 items)
    if (routeCache.size > 500) {
      const firstKey = routeCache.keys().next().value;
      routeCache.delete(firstKey);
    }

    return res.json(responsePayload);
  } catch (error) {
    console.error('[OSRM Routing Error]:', error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while contacting routing engine',
      isFallback: true,
    });
  }
}

module.exports = {
  getDrivingRoute,
};
