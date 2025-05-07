import StoryModel from "../../data/model";

export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleLogin(email, password) {
    const messageBox = document.querySelector("#login-message");

    try {
      const result = await StoryModel.login({ email, password });
      localStorage.setItem("token", result.token);
      messageBox.innerText = "Login berhasil!";
      window.location.hash = "/";
    } catch (error) {
      messageBox.innerText = `Login gagal: ${error.message}`;
    }
  }
}
