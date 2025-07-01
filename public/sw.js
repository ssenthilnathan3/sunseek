const CACHE_NAME = "sunset-companion-v1";
const urlsToCache = [
  "/",
  "/map",
  "/camera",
  "/social",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }),
  );
});

// Background sync for offline sunset data
self.addEventListener("sync", (event) => {
  if (event.tag === "sunset-data-sync") {
    event.waitUntil(syncSunsetData());
  }
});

async function syncSunsetData() {
  // Cache sunset times for the next 7 days
  const sunsetData = {
    cached: true,
    data: generateSunsetTimes(7),
  };

  const cache = await caches.open(CACHE_NAME);
  const response = new Response(JSON.stringify(sunsetData));
  await cache.put("/api/sunset-data", response);
}

function generateSunsetTimes(days) {
  const times = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    // Simple sunset time calculation (placeholder)
    const sunset = new Date(date);
    sunset.setHours(19, 30 - i * 2, 0); // Gradually earlier

    times.push({
      date: date.toISOString().split("T")[0],
      sunset: sunset.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      goldenHour: new Date(
        sunset.getTime() - 60 * 60 * 1000,
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      blueHour: new Date(sunset.getTime() + 30 * 60 * 1000).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      ),
      visibility: Math.random() > 0.3 ? "Good" : "Fair",
    });
  }

  return times;
}
