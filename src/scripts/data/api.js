import CONFIG from "../config";
import IDBHelper from "./database";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_STORIES: `${CONFIG.BASE_URL}/stories`,
  GET_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  SUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

/**
 * Register a new user
 */
export async function registerUser({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal mendaftar");
  return data;
}

/**
 * Login and return token + user info
 */
export async function loginUser({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login gagal");
  return data.loginResult;
}

/**
 * Get stories list
 */
export async function getData({ page = 1, size = 10, location = 0 } = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan. Silakan login.");

  const url = new URL(ENDPOINTS.GET_STORIES);
  url.searchParams.append("page", page);
  url.searchParams.append("size", size);
  url.searchParams.append("location", location);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Gagal memuat data");

    await IDBHelper.putStories(data.listStory);
    return data.listStory;
  } catch (error) {
    console.warn("Gagal mengambil dari API, ambil dari IndexedDB");
    return await IDBHelper.getAllStories();
  }
}

/**
 * Get detail story by ID
 */
export async function getDetailStory(id) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan.");

  try {
    const response = await fetch(ENDPOINTS.GET_DETAIL(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Gagal mengambil detail cerita");

    // Simpan ke IndexedDB
    IDBHelper.putStory(data.story);

    return data.story;
  } catch (error) {
    // Ambil dari IndexedDB saat offline
    const cachedStory = await IDBHelper.getStory(id);
    if (cachedStory) return cachedStory;
    throw error;
  }
}

/**
 * Add story with auth
 */
export async function addNewStory({
  description,
  photo = null,
  lat = null,
  lon = null,
}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan.");

  const formData = new FormData();
  formData.append("description", description);
  if (photo) formData.append("photo", photo);
  if (lat !== null) formData.append("lat", lat);
  if (lon !== null) formData.append("lon", lon);

  const response = await fetch(ENDPOINTS.ADD_STORY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal menambahkan cerita");
  return data;
}

/**
 * Add story as guest (tanpa token)
 */
export async function addStoryGuest({
  description,
  photo = null,
  lat = null,
  lon = null,
}) {
  const formData = new FormData();
  formData.append("description", description);
  if (photo) formData.append("photo", photo);
  if (lat !== null) formData.append("lat", lat);
  if (lon !== null) formData.append("lon", lon);

  const response = await fetch(ENDPOINTS.ADD_STORY_GUEST, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal menambahkan cerita");
  return data;
}

/**
 * Subscribe to web push notification
 */
export async function subscribeNotification({
  endpoint,
  keys: { p256dh, auth },
}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint, keys: { p256dh, auth } }),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Gagal berlangganan notifikasi");
  return data;
}

/**
 * Unsubscribe from web push notification
 */
export async function unsubscribeNotification({ endpoint }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token tidak ditemukan.");

  const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Gagal berhenti berlangganan");
  return data;
}
