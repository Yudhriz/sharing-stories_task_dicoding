import { loginUser } from "../../data/api";

export default class LoginPage {
  async render() {
    return `
      <section class="page-transition text-center">
        <h1>Masuk ke akun kamu</h1>
        <form id="loginForm" class="story-form">
          <label for="email">Email</label>
          <input id="email" type="email" name="email" placeholder="Email" required />
          
          <label for="password">Password</label>
          <input id="password" type="password" name="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <div id="login-message"></div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector("#loginForm");
    const messageBox = document.querySelector("#login-message");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;

      try {
        const result = await loginUser({ email, password });
        localStorage.setItem("token", result.token);
        messageBox.innerText = "Login berhasil!";
        window.location.hash = "/";
      } catch (error) {
        messageBox.innerText = `Login gagal: ${error.message}`;
      }
    });
  }
}
