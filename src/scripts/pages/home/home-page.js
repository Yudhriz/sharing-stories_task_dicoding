import { getData } from "../../data/api";

export default class HomePage {
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

    let currentPage = 1;
    let currentLocation = 0;
    const size = 5;

    const renderStories = async () => {
      storyListElement.innerHTML = `<p class="loading">Memuat cerita...</p>`;
      pageNumberEl.textContent = currentPage;
      prevPageBtn.disabled = currentPage === 1;

      try {
        const stories = await getData({
          page: currentPage,
          size,
          location: currentLocation,
        });

        if (!stories || stories.length === 0) {
          storyListElement.innerHTML = `<p class="empty">Belum ada cerita untuk ditampilkan.</p>`;
          nextPageBtn.disabled = true;
          return;
        }

        storyListElement.innerHTML = stories
          .map(
            (story) => `
            <a href="#/story/${story.id}" class="story-link">
              <article class="story-card">
                <img src="${story.photoUrl}" alt="Foto oleh ${story.name
              }" class="story-image" />
                <div class="story-content">
                  <h2>${story.name}</h2>
                  <p>${this.sanitizeContent(story.description)}</p>
                  <time datetime="${story.createdAt}">
                    ${new Date(story.createdAt).toLocaleString()}
                  </time>
                </div>
              </article>
            </a>
          `
          )
          .join("");

        // Disable next if jumlah story < size
        nextPageBtn.disabled = stories.length < size;
      } catch (error) {
        storyListElement.innerHTML = `<p class="error">Gagal memuat cerita: ${error.message}</p>`;

        if (error.message.includes('Token tidak ditemukan')) {
          setTimeout(() => {
            window.location.hash = '/login';
          }, 2000); // Redirect setelah 2 detik
        }
      }
    };

    locationFilter.addEventListener("change", (e) => {
      currentLocation = parseInt(e.target.value);
      currentPage = 1;
      renderStories();
    });

    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderStories();
      }
    });

    nextPageBtn.addEventListener("click", () => {
      currentPage++;
      renderStories();
    });

    renderStories();
  }
}
