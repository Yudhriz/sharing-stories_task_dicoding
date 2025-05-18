import CONFIG from "../config";

let currentMap = null;

export function initializeMap(mapId, onMapClick = null) {
  const mapContainer = document.getElementById(mapId);
  if (mapContainer._leaflet_id) {
    mapContainer._leaflet_id = null;
  }

  currentMap = L.map(mapId, {
    center: [-6.2, 106.8],
    zoom: 13,
    maxZoom: 17,
  });

  const osmLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap contributors",
    }
  ).addTo(currentMap);

  const satelliteLayer = L.tileLayer(
    `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.MAP_API}`,
    {
      attribution:
        '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>',
      tileSize: 512,
      zoomOffset: -1,
    }
  );

  const topoLayer = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenTopoMap contributors",
    }
  );

  L.control
    .layers(
      {
        "Street Map": osmLayer,
        "Peta Satelit": satelliteLayer,
        Topographic: topoLayer,
      },
      {}
    )
    .addTo(currentMap);

  let marker = null;

  // Aktifkan klik hanya jika diberikan fungsi onMapClick
  if (typeof onMapClick === "function") {
    currentMap.on("click", (e) => {
      try {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        // Tambahkan atau pindahkan marker
        if (marker) {
          currentMap.removeLayer(marker);
        }

        marker = L.marker([lat, lon]).addTo(currentMap);

        onMapClick({ lat, lon });
      } catch (error) {
        console.error("Error saat memproses klik peta:", error);
      }
    });
  }

  return currentMap;
}

export function getMapInstance() {
  return currentMap;
}
