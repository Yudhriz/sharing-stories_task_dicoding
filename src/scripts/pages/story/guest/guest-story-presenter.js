import StoryModel from "../../../data/model";
import { initializeMap } from "../../../utils/maps";

export default class GuestStoryPresenter {
  constructor() {
    this.photoBlob = null;
    this.lat = null;
    this.lon = null;
    this.stream = null;
    this.marker = null;
    this.elements = {};
  }

  async init() {
    this.initElements();
    this.initMap();
    this.initEventListeners();
  }

  initElements() {
    this.elements = {
      openCameraBtn: document.getElementById("openCameraBtn"),
      closeCameraBtn: document.getElementById("closeCameraBtn"),
      cameraSelect: document.getElementById("cameraSelect"),
      camera: document.getElementById("camera"),
      canvas: document.getElementById("canvas"),
      takePhotoBtn: document.getElementById("takePhoto"),
      preview: document.getElementById("preview"),
      uploadImage: document.getElementById("uploadImage"),
      form: document.getElementById("storyForm"),
      messageBox: document.getElementById("story-message"),
      locationText: document.getElementById("locationText"),
    };
  }

  initMap() {
    // Initialize map with callback for map clicks
    initializeMap("map", ({ lat, lon, marker }) => {
      this.lat = lat;
      this.lon = lon;
      this.marker = marker;
      this.elements.locationText.innerText = `Lokasi dipilih: (${lat.toFixed(
        5
      )}, ${lon.toFixed(5)})`;
    });
  }

  initEventListeners() {
    const {
      openCameraBtn,
      closeCameraBtn,
      cameraSelect,
      takePhotoBtn,
      uploadImage,
      form,
    } = this.elements;

    openCameraBtn.addEventListener("click", async () => {
      await this.getCameraDevices();
      await this.startCamera(cameraSelect.value);
      openCameraBtn.style.display = "none";
    });

    closeCameraBtn.addEventListener("click", () => this.stopCamera());

    cameraSelect.addEventListener("change", async () => {
      await this.startCamera(cameraSelect.value);
      openCameraBtn.style.display = "none";
    });

    takePhotoBtn.addEventListener("click", () => this.takePhoto());

    uploadImage.addEventListener("change", (e) => this.handleFileUpload(e));

    form.addEventListener("submit", async (e) => this.handleSubmit(e));
  }

  async getCameraDevices() {
    const { cameraSelect } = this.elements;
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

  async startCamera(deviceId) {
    const { camera, takePhotoBtn, closeCameraBtn, cameraSelect } =
      this.elements;

    if (this.stream) this.stopCamera();

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: deviceId ? { exact: deviceId } : undefined },
    });

    camera.srcObject = this.stream;
    camera.style.display = "block";
    takePhotoBtn.style.display = "inline-block";
    closeCameraBtn.style.display = "inline-block";
    cameraSelect.style.display = "inline-block";
  }

  stopCamera() {
    const {
      camera,
      takePhotoBtn,
      closeCameraBtn,
      cameraSelect,
      openCameraBtn,
    } = this.elements;

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    camera.style.display = "none";
    takePhotoBtn.style.display = "none";
    closeCameraBtn.style.display = "none";
    cameraSelect.style.display = "none";
    openCameraBtn.style.display = "inline-block";
  }

  takePhoto() {
    const { camera, canvas, preview } = this.elements;

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(camera, 0, 0);

    canvas.toBlob((blob) => {
      this.photoBlob = blob;
      preview.src = URL.createObjectURL(blob);
      preview.style.display = "block";
    }, "image/jpeg");

    this.stopCamera();
  }

  handleFileUpload(e) {
    const { preview } = this.elements;
    const file = e.target.files[0];

    if (file) {
      this.photoBlob = file;
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { form, messageBox, preview, locationText } = this.elements;
    const description = form.description.value.trim();

    if (!description) {
      messageBox.innerText = "Deskripsi cerita tidak boleh kosong.";
      return;
    }

    if (!this.photoBlob) {
      messageBox.innerText = "Silakan ambil atau unggah foto terlebih dahulu.";
      return;
    }

    if (this.lat === null || this.lon === null) {
      messageBox.innerText = "Silakan pilih lokasi pada peta.";
      return;
    }

    try {
      await StoryModel.addAsGuest({
        description,
        photo: this.photoBlob,
        lat: this.lat,
        lon: this.lon,
      });

      alert("Cerita berhasil ditambahkan sebagai tamu!");
      form.reset();
      preview.style.display = "none";
      locationText.innerText = "Klik pada peta untuk memilih lokasi.";

      if (this.marker) {
        // Get map instance to remove marker
        const mapInstance = window.currentMap;
        if (mapInstance) mapInstance.removeLayer(this.marker);
        this.marker = null;
      }

      setTimeout(() => {
        window.location.hash = "/";
      }, 1500);
    } catch (err) {
      messageBox.innerText = `Gagal menambahkan cerita: ${err.message}`;
    }
  }
}
