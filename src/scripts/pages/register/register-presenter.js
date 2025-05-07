import StoryModel from "../../data/model";

export default class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleRegister(name, email, password) {
    const messageBox = document.querySelector("#register-message");

    try {
      await StoryModel.register({ name, email, password });
      messageBox.innerText = "Registrasi berhasil! Silakan login.";
      window.location.hash = "/login";
    } catch (error) {
      messageBox.innerText = `Registrasi gagal: ${error.message}`;
    }
  }
}
