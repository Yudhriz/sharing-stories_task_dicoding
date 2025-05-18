import StoryModel from "../../data/model";

export default class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleRegister(name, email, password) {
    try {
      await StoryModel.register({ name, email, password });
      this.view.showSuccessMessage("Registrasi berhasil! Silakan login.");
      window.location.hash = "/login";
    } catch (error) {
      this.view.showErrorMessage(`Registrasi gagal: ${error.message}`);
    }
  }
}
