import { convertBase64ToUint8Array } from "./index";
import CONFIG from "../config";
import model from "../data/model";

const VAPID_PUBLIC_KEY = CONFIG.VAPID_PUBLIC_KEY;

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API tidak didukung di browser ini.");
    return false;
  }

  if (isNotificationGranted()) return true;

  const status = await Notification.requestPermission();

  switch (status) {
    case "granted":
      return true;
    case "denied":
      alert("Izin notifikasi ditolak.");
      return false;
    case "default":
    default:
      alert("Izin notifikasi ditutup atau diabaikan.");
      return false;
  }
}

export async function getPushSubscription() {
  if (!("serviceWorker" in navigator)) return null;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    console.error("Service worker belum terdaftar.");
    return null;
  }

  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  const subscription = await getPushSubscription();
  return !!subscription;
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) return;

  const alreadySubscribed = await isCurrentPushSubscriptionAvailable();
  if (alreadySubscribed) {
    alert("Sudah berlangganan push notification.");
    return;
  }

  let pushSubscription = null;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) throw new Error("Service worker belum terdaftar.");

    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await model.subscribeNotification({ endpoint, keys });

    if (response.error) {
      console.error("subscribe: Gagal dari server:", response);
      await pushSubscription.unsubscribe();
      alert("Langganan push notification gagal diaktifkan.");
      return;
    }

    alert("Langganan push notification berhasil diaktifkan.");
  } catch (error) {
    console.error("subscribe: Error:", error);

    if (pushSubscription) {
      try {
        await pushSubscription.unsubscribe();
      } catch (e) {
        console.warn("Gagal undo subscribe:", e);
      }
    }

    alert("Langganan push notification gagal diaktifkan.");
  }
}

export async function unsubscribe() {
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      alert("Belum berlangganan push notification.");
      return;
    }

    const { endpoint } = pushSubscription.toJSON();
    const response = await model.unsubscribeNotification({ endpoint });

    if (response.error) {
      console.error("unsubscribe: Gagal dari server:", response);
      alert("Langganan push notification gagal dinonaktifkan.");
      return;
    }

    const result = await pushSubscription.unsubscribe();
    if (!result) {
      // Jika gagal unsubscribe di browser, rollback API agar tetap sinkron
      await model.subscribeNotification(pushSubscription.toJSON());
      alert("Gagal berhenti langganan notifikasi.");
      return;
    }

    alert("Langganan push notification berhasil dinonaktifkan.");
  } catch (error) {
    console.error("unsubscribe: Error:", error);
    alert("Gagal berhenti langganan notifikasi.");
  }
}
