import CONFIG from "../../config";
import { addNewStory } from "../../data/api";

export default class AddStoryPage {
  async render() {
    return `
      <section class="page-transition text-center">
        <h1>Tambahkan Story Kamu</h1>
        <form id="storyForm" class="story-form">
          <label for="description">Cerita</label>
          <textarea id="description" name="description" placeholder="Cerita kamu..." required></textarea>

          <fieldset class="camera-section">
            <legend>Kamera</legend>
            <video id="camera" autoplay muted playsinline></video>
            <canvas id="canvas" style="display: none;"></canvas>

            <div class="camera-controls">
              <button id="openCameraBtn" type="button">Buka Kamera</button>
              <button id="closeCameraBtn" type="button" style="display: none;">Tutup Kamera</button>
              <button id="takePhoto" type="button" style="display: none;">Ambil Foto</button>
              <select id="cameraSelect" style="display: none;" aria-label="Pilih kamera"></select>
            </div>
          </fieldset>

          <p>Atau unggah dari galeri:</p>
          <label for="uploadImage">Unggah Gambar</label>
          <input type="file" id="uploadImage" accept="image/*" />

          <img id="preview" alt="Preview gambar" style="display:none; border-radius: 8px; max-width: 100%;" />

          <div>
            <label for="map">Pilih Lokasi pada Peta</label>
            <div id="map" style="height: 300px; margin-top: 1rem; border-radius: 8px;" aria-label="Peta lokasi cerita"></div>
            <p id="locationText">Klik pada peta untuk memilih lokasi.</p>
          </div>

          <button type="submit">Submit</button>
        </form>
        <div id="story-message"></div>
      </section>
    `;
  }

  async afterRender() {
    const openCameraBtn = document.getElementById("openCameraBtn");
    const closeCameraBtn = document.getElementById("closeCameraBtn");
    const cameraSelect = document.getElementById("cameraSelect");
    const camera = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const takePhotoBtn = document.getElementById("takePhoto");
    const preview = document.getElementById("preview");
    const uploadImage = document.getElementById("uploadImage");
    const form = document.getElementById("storyForm");
    const messageBox = document.getElementById("story-message");
    const locationText = document.getElementById("locationText");

    let photoBlob = null;
    let lat = null;
    let lon = null;
    let stream = null;
    let marker = null;

    // 🗺️ Inisialisasi Peta
    const mapContainer = document.getElementById("map");
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null; // Reset agar Leaflet bisa re-init
    }

    const map = L.map("map", {
      center: [-6.2, 106.8],
      zoom: 13,
      maxZoom: 17,
    });

    const osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      }
    ).addTo(map);

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
      .addTo(map);

    map.on("click", (e) => {
      lat = e.latlng.lat;
      lon = e.latlng.lng;
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lon]).addTo(map);
      locationText.innerText = `Lokasi dipilih: (${lat.toFixed(
        5
      )}, ${lon.toFixed(5)})`;
    });

    // 🎥 Kamera
    async function getCameraDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      cameraSelect.innerHTML = "";
      videoDevices.forEach((device) => {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.text = device.label || `Kamera ${cameraSelect.length + 1}`;
        cameraSelect.appendChild(option);
      });
    }

    async function startCamera(deviceId) {
      if (stream) stopCamera();
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId ? { exact: deviceId } : undefined },
      });
      camera.srcObject = stream;
      camera.style.display = "block";
      takePhotoBtn.style.display = "inline-block";
      closeCameraBtn.style.display = "inline-block";
      cameraSelect.style.display = "inline-block";
    }

    function stopCamera() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
      camera.style.display = "none";
      takePhotoBtn.style.display = "none";
      closeCameraBtn.style.display = "none";
      cameraSelect.style.display = "none";
      openCameraBtn.style.display = "inline-block";
    }

    openCameraBtn.addEventListener("click", async () => {
      await getCameraDevices();
      await startCamera(cameraSelect.value);
      openCameraBtn.style.display = "none";
    });

    closeCameraBtn.addEventListener("click", () => stopCamera());

    cameraSelect.addEventListener("change", async () => {
      await startCamera(cameraSelect.value);
      openCameraBtn.style.display = "none";
    });

    takePhotoBtn.addEventListener("click", () => {
      canvas.width = camera.videoWidth;
      canvas.height = camera.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(camera, 0, 0);
      canvas.toBlob((blob) => {
        photoBlob = blob;
        preview.src = URL.createObjectURL(blob);
        preview.style.display = "block";
      }, "image/jpeg");
      stopCamera();
    });

    uploadImage.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        photoBlob = file;
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = form.description.value.trim();

      if (!description) {
        messageBox.innerText = "Deskripsi cerita tidak boleh kosong.";
        return;
      }
      if (!photoBlob) {
        messageBox.innerText =
          "Silakan ambil atau unggah foto terlebih dahulu.";
        return;
      }
      if (lat === null || lon === null) {
        messageBox.innerText = "Silakan pilih lokasi pada peta.";
        return;
      }

      try {
        await addNewStory({ description, photo: photoBlob, lat, lon });
        alert("Cerita berhasil ditambahkan!");
        form.reset();
        preview.style.display = "none";
        locationText.innerText = "Klik pada peta untuk memilih lokasi.";
        if (marker) map.removeLayer(marker);
        setTimeout(() => {
          window.location.hash = "/";
        }, 1500);
      } catch (err) {
        messageBox.innerText = `Gagal menambahkan cerita: ${err.message}`;
      }
    });

    // Untuk cleanup saat navigasi
    window.cleanupCamera = () => stopCamera();
  }
}
