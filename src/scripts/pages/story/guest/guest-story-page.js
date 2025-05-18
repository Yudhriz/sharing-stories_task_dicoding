import GuestStoryPresenter from "./guest-story-presenter";

export default class GuestStoryPage {
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

            <div class="camera-controls">
              <button id="openCameraBtn" type="button">Buka Kamera</button>
              <button id="closeCameraBtn" type="button" style="display: none;">Tutup Kamera</button>
              <button id="takePhoto" type="button" style="display: none;">Ambil Foto</button>
              <select id="cameraSelect" style="display: none;"></select>
            </div>
          </fieldset>

          <p>Atau unggah dari galeri:</p>
          <input type="file" id="uploadImage" accept="image/*" />

          <img id="preview" alt="Preview gambar" style="display:none; max-width:100%; border-radius:8px;" />

          <div>
            <label for="map">Pilih Lokasi pada Peta</label>
            <div id="map" style="height:300px; margin-top:1rem; border-radius:8px;"></div>
            <p id="locationText">Klik pada peta untuk memilih lokasi.</p>
          </div>

          <button type="submit">Submit</button>
        </form>
        <div id="story-message"></div>
      </section>
    `;
  }

  async afterRender() {
    const presenter = new GuestStoryPresenter(this);

    const form = document.getElementById("storyForm");
    const openCameraBtn = document.getElementById("openCameraBtn");
    const closeCameraBtn = document.getElementById("closeCameraBtn");
    const cameraSelect = document.getElementById("cameraSelect");
    const takePhotoBtn = document.getElementById("takePhoto");
    const camera = document.getElementById("camera");
    const preview = document.getElementById("preview");
    const uploadImage = document.getElementById("uploadImage");
    const locationText = document.getElementById("locationText");
    const messageBox = document.getElementById("story-message");

    await presenter.initMap();

    openCameraBtn.addEventListener("click", async () => {
      const devices = await presenter.getCameraDevices();
      cameraSelect.innerHTML = devices
        .map(
          (d) => `<option value="${d.deviceId}">${d.label || "Kamera"}</option>`
        )
        .join("");

      const stream = await presenter.startCamera(cameraSelect.value);
      camera.srcObject = stream;

      openCameraBtn.style.display = "none";
      closeCameraBtn.style.display = "inline-block";
      takePhotoBtn.style.display = "inline-block";
      cameraSelect.style.display = "inline-block";
    });

    closeCameraBtn.addEventListener("click", () => {
      presenter.stopCamera();
      camera.srcObject = null;

      openCameraBtn.style.display = "inline-block";
      closeCameraBtn.style.display = "none";
      takePhotoBtn.style.display = "none";
      cameraSelect.style.display = "none";
    });

    cameraSelect.addEventListener("change", async () => {
      const stream = await presenter.startCamera(cameraSelect.value);
      camera.srcObject = stream;
    });

    takePhotoBtn.addEventListener("click", async () => {
      const blob = await presenter.takePhoto(camera);
      preview.src = URL.createObjectURL(blob);
      preview.style.display = "block";
    });

    uploadImage.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        preview.src = presenter.handleFileUpload(file);
        preview.style.display = "block";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = form.description.value;
      const result = await presenter.handleSubmit(description);

      if (result.success) {
        messageBox.innerText = "Cerita berhasil ditambahkan!";
        form.reset();
        preview.style.display = "none";
        locationText.innerText = "Klik pada peta untuk memilih lokasi.";
        presenter.resetMarker();

        setTimeout(() => {
          window.location.hash = "/";
        }, 1500);
      } else {
        messageBox.innerText = result.message;
      }
    });

    window.cleanupCamera = () => {
      presenter.stopCamera();
      camera.srcObject = null;
    };
  }

  updateLocationText(lat, lon) {
    const locationText = document.getElementById("locationText");
    locationText.innerText = `Lokasi dipilih: (${lat.toFixed(5)}, ${lon.toFixed(
      5
    )})`;
  }
}
