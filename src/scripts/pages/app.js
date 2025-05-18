import getRoutes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isServiceWorkerAvailable } from "../utils";
import {
  isCurrentPushSubscriptionAvailable,
  isNotificationAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #hasSetupPushNotification = false;

  async #setupPushNotification() {
    if (this.#hasSetupPushNotification) return;
    this.#hasSetupPushNotification = true;

    const desktopBtn = document.querySelector("#subscribe-btn-desktop");
    const mobileBtn = document.querySelector("#subscribe-btn-mobile");

    if (!("serviceWorker" in navigator)) return;

    const buttons = [desktopBtn, mobileBtn].filter(Boolean); // Ambil tombol yang ada

    const setButtonState = (isSubscribed) => {
      buttons.forEach((btn) => {
        if (!btn) return;

        btn.innerHTML = isSubscribed
          ? 'Berhenti Langganan <i data-feather="bell-off" class="icon"></i>'
          : 'Langganan <i data-feather="bell" class="icon"></i>';

        btn.classList.toggle("subscribed", isSubscribed);
        btn.style.display = "inline-block";
      });
      feather.replace(); // refresh icons
    };

    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();

      setButtonState(isSubscribed);

      buttons.forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (btn.classList.contains("subscribed")) {
            try {
              await unsubscribe();
              setButtonState(false);
              alert("Berhenti berlangganan notifikasi.");
            } catch (err) {
              console.error("Gagal unsubscribe:", err);
              alert("Gagal berhenti langganan.");
            }
          } else {
            try {
              await subscribe();
              setButtonState(true);
              alert("Berhasil langganan notifikasi!");
            } catch (err) {
              console.error("Gagal subscribe:", err);
              alert("Gagal berlangganan notifikasi.");
            }
          }
        });
      });
    } catch (error) {
      console.error("Error saat setup push notification:", error);
    }
  }

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupSkipToContent();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupSkipToContent() {
    document.addEventListener("DOMContentLoaded", () => {
      const mainContent = document.querySelector("#main-content");
      const skipLink = document.querySelector(".skip-link");

      if (mainContent && skipLink) {
        skipLink.addEventListener("click", (event) => {
          event.preventDefault(); // Cegah reload
          skipLink.blur(); // Hapus fokus dari link
          mainContent.setAttribute("tabindex", "-1"); // Agar bisa difokus
          mainContent.focus(); // Fokuskan ke konten utama
          mainContent.scrollIntoView({ behavior: "smooth" }); // Scroll ke konten utama
        });

        // Aksesibilitas tambahan: memungkinkan navigasi lewat keyboard
        skipLink.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            skipLink.click();
          }
        });
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const routes = getRoutes();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = "<p>Halaman tidak ditemukan.</p>";
      return;
    }

    // Bersihkan kamera jika ada
    if (window.cleanupCamera) {
      window.cleanupCamera();
      window.cleanupCamera = null;
    }

    // Render konten halaman
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender?.();
        feather.replace();

        if (isServiceWorkerAvailable() && isNotificationAvailable()) {
          this.#setupPushNotification();
        }
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender?.();

      if (isServiceWorkerAvailable() && isNotificationAvailable()) {
        this.#setupPushNotification();
      }
    }
  }
}

export default App;
