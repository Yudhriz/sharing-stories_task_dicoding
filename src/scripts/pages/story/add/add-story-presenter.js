import StoryModel from "../../../data/model";
import { initializeMap } from "../../../utils/maps";
import { isCurrentPushSubscriptionAvailable } from "../../../utils/notification-helper";

export default class AddStoryPresenter {
  constructor(view) {
    this._view = view;
    this.lat = null;
    this.lon = null;
    this.marker = null;
    this.photoBlob = null;
    this.stream = null;
  }

  async initMap() {
    initializeMap("map", ({ lat, lon, marker }) => {
      this.lat = lat;
      this.lon = lon;
      this.marker = marker;
      this._view.updateLocationText(lat, lon);
    });
  }

  async getCameraDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput");
  }

  async startCamera(deviceId) {
    if (this.stream) this.stopCamera();

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: deviceId ? { exact: deviceId } : undefined },
    });

    return this.stream;
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  async takePhoto(videoElement) {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        this.photoBlob = blob;
        resolve(blob);
      }, "image/jpeg");
    });
  }

  handleFileUpload(file) {
    this.photoBlob = file;
    return URL.createObjectURL(file);
  }

  async handleSubmit(description) {
    if (!description.trim()) {
      return {
        success: false,
        message: "Deskripsi cerita tidak boleh kosong.",
      };
    }

    if (!this.photoBlob) {
      return {
        success: false,
        message: "Silakan ambil atau unggah foto terlebih dahulu.",
      };
    }

    if (this.lat === null || this.lon === null) {
      return { success: false, message: "Silakan pilih lokasi pada peta." };
    }

    try {
      await StoryModel.add({
        description,
        photo: this.photoBlob,
        lat: this.lat,
        lon: this.lon,
      });

      // ✅ Push Notification jika user sudah subscribe
      if (await isCurrentPushSubscriptionAvailable()) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.showNotification("Story berhasil dibuat", {
            body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
            icon: "/story_freepik.png",
            tag: "new-story",
            renotify: true,
          });
        }
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: `Gagal menambahkan cerita: ${err.message}`,
      };
    }
  }

  resetMarker() {
    if (this.marker) {
      const mapInstance = window.currentMap;
      if (mapInstance) mapInstance.removeLayer(this.marker);
      this.marker = null;
    }
  }
}
