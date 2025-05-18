import HomePresenter from "./home-presenter";

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
  }

  sanitizeContent(content) {
    return content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

  async render() {
    return `
      <section class="container">
        <h1><i data-feather="book-open" class="icon"></i>Welcome to Alvingky Sharing Story App</h1>
        <p><i data-feather="users" class="icon"></i> Cerita menarik dari para pengguna.</p>

        <div class="controls">
          <div class="filter-controls">
            <label for="locationFilter">Tampilkan:</label>
            <select id="locationFilter" aria-label="Filter Lokasi">
              <option value="0" selected>Semua cerita</option>
              <option value="1">Hanya yang memiliki lokasi</option>
            </select>
          </div>
          <div class="pagination-controls">
            <button id="prevPage" class="pagination-btn" disabled>
              <i data-feather="arrow-left" class="icon pagination-icon"></i> 
              <span class="pagination-text">Prev</span>
            </button>
            <span id="pageNumber">1</span>
            <button id="nextPage" class="pagination-btn">
              <span class="pagination-text">Next</span>
              <i data-feather="arrow-right" class="icon pagination-icon"></i>
            </button>
          </div>
        </div>

        <div id="map-section" class="map-section">
          <h2><i data-feather="map-pin" class="icon"></i> Lokasi Cerita</h2>
          <div id="storyMap" style="height: 300px; border-radius: 8px; margin-bottom: 20px;"></div>
        </div>

        <h2><i data-feather="list" class="icon"></i> Daftar Cerita</h2>
        <div id="story-list" class="story-list">
          <p class="loading">Memuat cerita...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyListElement = document.querySelector("#story-list");
    const locationFilter = document.querySelector("#locationFilter");
    const prevPageBtn = document.querySelector("#prevPage");
    const nextPageBtn = document.querySelector("#nextPage");
    const pageNumberEl = document.querySelector("#pageNumber");

    this.storyListElement = storyListElement;
    this.pageNumberEl = pageNumberEl;
    this.prevPageBtn = prevPageBtn;
    this.nextPageBtn = nextPageBtn;

    locationFilter.addEventListener("change", (e) => {
      const location = parseInt(e.target.value);
      this.presenter.changeLocation(location);
    });

    prevPageBtn.addEventListener("click", () => {
      if (this.presenter.currentPage > 1) {
        this.presenter.changePage(this.presenter.currentPage - 1);
      }
    });

    nextPageBtn.addEventListener("click", () => {
      this.presenter.changePage(this.presenter.currentPage + 1);
    });

    // Initialize map
    this.presenter.initMap();

    // Render stories
    this.presenter.renderStories();

    // Initialize Feather icons
    if (window.feather) {
      window.feather.replace();
    }
  }
  showLoadingMessage() {
    this.storyListElement.innerHTML = `<p class="loading">Memuat cerita...</p>`;
  }

  showEmptyMessage() {
    this.storyListElement.innerHTML = `<p class="empty">Belum ada cerita untuk ditampilkan.</p>`;
  }

  showErrorMessage(message) {
    this.storyListElement.innerHTML = `<p class="error">${message}</p>`;
  }

  updatePageNumber(currentPage) {
    this.pageNumberEl.textContent = currentPage;
  }

  setPrevButtonDisabled(isDisabled) {
    this.prevPageBtn.disabled = isDisabled;
  }

  setNextButtonDisabled(isDisabled) {
    this.nextPageBtn.disabled = isDisabled;
  }

  renderStoryCards(html) {
    this.storyListElement.innerHTML = html;
  }
}
