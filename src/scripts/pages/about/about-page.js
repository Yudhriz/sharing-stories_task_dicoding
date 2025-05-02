export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>Tentang Aplikasi</h1>
        <p>Story App adalah aplikasi sederhana yang menampilkan berbagai cerita dari pengguna.</p>
        <p>Proyek ini dibuat untuk memenuhi submission kelas Web API Dicoding.</p>
        <ul>
          <li>✅ SPA dengan Hash Routing</li>
          <li>✅ Mengambil data dari Story API</li>
          <li>✅ Desain responsif dan ramah pengguna</li>
        </ul>
      </section>
    `;
  }

  async afterRender() {
    // Bisa ditambah animasi atau logika tambahan di sini jika perlu
  }
}
