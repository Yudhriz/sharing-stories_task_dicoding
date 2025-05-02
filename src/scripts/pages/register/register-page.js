import { registerUser } from "../../data/api";

export default class RegisterPage {
  async render() {
    return `
      <section class="page-transition text-center">
        <h1>Daftar akun kamu</h1>
        <form id="registerForm" class="story-form">
          <label for="name">Name</label>
          <input id="name" type="text" name="name" placeholder="Name" required />

          <label for="email">Email</label>
          <input id="email" type="email" name="email" placeholder="Email" required />

          <label for="password">Password</label>
          <input id="password" type="password" name="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
        <div id="register-message"></div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector("#registerForm");
    const messageBox = document.querySelector("#register-message");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      try {
        await registerUser({ name, email, password });
        messageBox.innerText = "Registrasi berhasil! Silakan login.";
        window.location.hash = "/login";
      } catch (error) {
        messageBox.innerText = `Registrasi gagal: ${error.message}`;
      }
    });
  }
}
