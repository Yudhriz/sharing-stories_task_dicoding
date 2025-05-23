import "../styles/styles.css";
import App from "./pages/app";
import { registerServiceWorker } from "./utils";

import IDBHelper from "./data/database";

document
  .getElementById("clear-cache-button")
  .addEventListener("click", async () => {
    const confirmClear = confirm(
      "Yakin ingin menghapus semua data cerita yang tersimpan offline?"
    );
    if (confirmClear) {
      await IDBHelper.clearStories();
      alert("Data offline berhasil dihapus.");
    }
  });

const applyPageTransition = () => {
  const mainContent = document.querySelector("#main-content");
  if (mainContent) {
    mainContent.classList.remove("page-transition"); // Reset animasi
    void mainContent.offsetWidth; // Trigger reflow
    mainContent.classList.add("page-transition"); // Tambah animasi
  }
};

const updateNavigation = () => {
  const token = localStorage.getItem("token");

  const loginNav = document.getElementById("nav-login");
  const registerNav = document.getElementById("nav-register");
  const logoutNav = document.getElementById("nav-logout");
  const addNav = document.getElementById("nav-add");
  const guestNav = document.getElementById("nav-guest");
  const logoutBtn = document.getElementById("logout-btn");

  if (token) {
    if (loginNav) loginNav.style.display = "none";
    if (registerNav) registerNav.style.display = "none";
    if (logoutNav) logoutNav.style.display = "block";
    if (addNav) addNav.style.display = "block";
    if (guestNav) guestNav.style.display = "none";
  } else {
    if (loginNav) loginNav.style.display = "block";
    if (registerNav) registerNav.style.display = "block";
    if (logoutNav) logoutNav.style.display = "none";
    if (addNav) addNav.style.display = "none";
    if (guestNav) guestNav.style.display = "block";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      alert("Berhasil logout!");
      window.location.hash = "/login";
      location.reload(); // Reset tampilan dan token
    });
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await registerServiceWorker();

  await app.renderPage();
  applyPageTransition();
  updateNavigation(); // Update nav saat load

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
    applyPageTransition();
    updateNavigation(); // Update nav saat pindah halaman
  });
});
