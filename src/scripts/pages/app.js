import getRoutes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
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

  async renderPage() {
    const url = getActiveRoute();
    const routes = getRoutes(); // Memanggil getRoutes untuk mendapatkan rute dinamis
    const page = routes[url]; // Mendapatkan halaman berdasarkan URL

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
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender?.();
    }
  }
}

export default App;
