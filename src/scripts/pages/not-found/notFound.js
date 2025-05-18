export default class NotFoundPage {
  async render() {
    return `
        <section class="container">
          <h1>404 - Halaman Tidak Ditemukan</h1>
          <p>Alamat yang Anda tuju tidak tersedia.</p>
        </section>
      `;
  }

  async afterRender() {
    // Bisa ditambah animasi atau logika tambahan di sini jika perlu
  }
}
