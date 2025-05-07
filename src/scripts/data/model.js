import {
  registerUser,
  loginUser,
  getData,
  getDetailStory,
  addNewStory,
  addStoryGuest,
  subscribeNotification,
  unsubscribeNotification,
} from "./api";

const StoryModel = {
  // 🔐 Auth
  async register({ name, email, password }) {
    return await registerUser({ name, email, password });
  },

  async login({ email, password }) {
    return await loginUser({ email, password });
  },

  // 📖 Data Story
  async getAll({ page = 1, size = 10, location = 0 } = {}) {
    return await getData({ page, size, location });
  },

  async getDetail(id) {
    return await getDetailStory(id);
  },

  async add({ description, photo = null, lat = null, lon = null }) {
    return await addNewStory({ description, photo, lat, lon });
  },

  async addAsGuest({ description, photo = null, lat = null, lon = null }) {
    return await addStoryGuest({ description, photo, lat, lon });
  },

  // 🔔 Web Push Notification
  async subscribeNotification({ endpoint, keys }) {
    return await subscribeNotification({ endpoint, keys });
  },

  async unsubscribeNotification({ endpoint }) {
    return await unsubscribeNotification({ endpoint });
  },
};

export default StoryModel;
