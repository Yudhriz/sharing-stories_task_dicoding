import { parseActivePathname } from "../../routes/url-parser";
import StoryModel from "../../data/model";

export default class DetailPresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    const { id } = parseActivePathname();

    try {
      const story = await StoryModel.getDetail(id);
      this.view.showDetail(story);
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}
