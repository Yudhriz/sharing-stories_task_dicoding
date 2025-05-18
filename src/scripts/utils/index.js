export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log("Service Worker API unsupported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/sw.bundle.js"
    );
    console.log("Service worker telah terpasang", registration);
  } catch (error) {
    console.log("Failed to install service worker:", error);
  }
}

export function convertBase64ToUint8Array(base64String) {
  // Tambahkan padding jika diperlukan
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  // Decode base64 ke string biner
  const rawData = window.atob(base64);

  // Ubah string biner ke Uint8Array
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
