import StoryModel from "../../data/model";
export default class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  async handleLogin(email, password) {
    try {
      const result = await StoryModel.login({ email, password });

      // Beri tahu View untuk menyimpan token dan navigasi
      this.view.onLoginSuccess(result.token);
    } catch (error) {
      this.view.showLoginError(error.message);
    }
  }
}
