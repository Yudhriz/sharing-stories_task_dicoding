import StoryModel from "../../data/model";
import { initializeMap } from "../../utils/maps";

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.currentPage = 1;
    this.currentLocation = 0;
    this.size = 5;
    this.map = null;
    this.markers = [];
  }

  async renderStories() {
    this.view.showLoadingMessage();
    this.view.updatePageNumber(this.currentPage);
    this.view.setPrevButtonDisabled(this.currentPage === 1);

    try {
      const stories = await StoryModel.getAll({
        page: this.currentPage,
        size: this.size,
        location: this.currentLocation,
      });

      if (!stories || stories.length === 0) {
        this.view.showEmptyMessage();
        this.view.setNextButtonDisabled(true);
        return;
      }

      const storyHtml = stories
        .map(
          (story) => `
          <a href="#/story/${story.id}" class="story-link">
            <article class="story-card">
              <img src="${story.photoUrl}" alt="Foto oleh ${
            story.name
          }" class="story-image" />
              <div class="story-content">
                <h2>${story.name}</h2>
                <p>${this.view.sanitizeContent(story.description)}</p>
                <time datetime="${story.createdAt}">
                  ${new Date(story.createdAt).toLocaleString()}
                </time>
              </div>
            </article>
          </a>
        `
        )
        .join("");

      this.view.renderStoryCards(storyHtml);
      this.view.setNextButtonDisabled(stories.length < this.size);

      if (this.map) {
        this.updateMapMarkers(stories);
      }
    } catch (error) {
      this.view.showErrorMessage(`Gagal memuat cerita: ${error.message}`);
      if (error.message.includes("Token tidak ditemukan")) {
        setTimeout(() => {
          window.location.hash = "/login";
        }, 2000);
      }
    }
  }

  initMap() {
    // Initialize map without click handler (view only)
    this.map = initializeMap("storyMap");

    // Set a better default view for Indonesia with higher zoom
    this.map.setView([-2.5, 118], 5.5);
  }

  updateMapMarkers(stories) {
    // Clear existing markers
    this.clearMarkers();

    // Add markers for stories that have location data
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map)
          .bindPopup(`
            <div class="map-popup">
              <h3>${story.name}</h3>
              <img src="${story.photoUrl}" alt="Foto oleh ${
          story.name
        }" class="popup-image" />
              <p>${this.view.sanitizeContent(
                story.description.substring(0, 100)
              )}${story.description.length > 100 ? "..." : ""}</p>
              <a href="#/story/${story.id}" class="popup-link">Lihat detail</a>
            </div>
          `);
        this.markers.push(marker);
      }
    });

    // If we have markers, fit map to show all markers with limited zoom
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1), {
        maxZoom: 10, // Limit max zoom level when fitting bounds
        duration: 0.5, // Smooth animation
      });
    }
  }

  clearMarkers() {
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];
  }

  changeLocation(location) {
    this.currentLocation = location;
    this.currentPage = 1;
    this.renderStories();
  }

  changePage(page) {
    this.currentPage = page;
    this.renderStories();
  }
}
