import { getDetailStory } from "../../data/api";
import { parseActivePathname } from "../../routes/url-parser";

export default class DetailPage {
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
      <section class="container page-transition">
        <h1>Detail Story</h1>
        <div id="story-detail"></div>
      </section>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    const detailContainer = document.querySelector("#story-detail");

    try {
      const story = await getDetailStory(id);
      const hasLocation = story.lat !== null && story.lon !== null;

      detailContainer.innerHTML = `
        <article class="story-detail-card">
          <img src="${story.photoUrl}" alt="Foto oleh ${
        story.name
      }" class="detail-image"/>
          <div class="story-info">
            <h2>${story.name}</h2>
            <p>${this.sanitizeContent(story.description)}</p>
            <time datetime="${story.createdAt}">
              Dibuat pada: ${new Date(story.createdAt).toLocaleString()}
            </time>
            ${
              hasLocation
                ? `<p>Lokasi: (${story.lat}, ${story.lon})</p>
                   <div id="map" style="height: 300px; margin-top: 1rem; border-radius: 8px;"></div>`
                : `<p>Lokasi tidak tersedia</p>`
            }
          </div>
          <a href="#/" class="back-button">Kembali ke Beranda</a>
        </article>
      `;

      if (hasLocation) {
        const map = L.map("map").setView([story.lat, story.lon], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker
          .bindPopup(
            `<b>${story.name}</b><br>${this.sanitizeContent(story.description)}`
          )
          .openPopup();
      }
    } catch (error) {
      detailContainer.innerHTML = `<p class="error">Gagal memuat detail: ${error.message}</p>`;
    }
  }
}
