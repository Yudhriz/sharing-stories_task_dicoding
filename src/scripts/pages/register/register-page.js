import RegisterPresenter from "./register-presenter";

export default class RegisterPage {
  constructor() {
    this.presenter = new RegisterPresenter(this);
  }

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

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;
      this.presenter.handleRegister(name, email, password);
    });
  }

  showSuccessMessage(message) {
    const messageBox = document.querySelector("#register-message");
    if (!messageBox) return;
    messageBox.innerText = message;
    messageBox.style.color = "green";
  }

  showErrorMessage(message) {
    const messageBox = document.querySelector("#register-message");
    if (!messageBox) return;
    messageBox.innerText = message;
    messageBox.style.color = "red";
  }
}
