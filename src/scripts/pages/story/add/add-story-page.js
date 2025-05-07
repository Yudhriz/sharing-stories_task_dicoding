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
    const { default: AddStoryPresenter } = await import(
      "./add-story-presenter.js"
    );
    const presenter = new AddStoryPresenter();
    await presenter.init();

    window.cleanupCamera = () => presenter.stopCamera();
  }
}
