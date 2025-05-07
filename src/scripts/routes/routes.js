import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import DetailPage from "../pages/detail/detail-page";
import AddStoryPage from "../pages/story/add/add-story-page";
import GuestStoryPage from "../pages/story/guest/guest-story-page";

import { isLoggedIn } from "../utils/auth";

// Fungsi untuk mendapatkan rute dinamis
const getRoutes = () => {
  return {
    "/": new HomePage(),
    "/about": new AboutPage(),
    "/login": new LoginPage(),
    "/register": new RegisterPage(),
    "/story/:id": new DetailPage(),
    "/add": new AddStoryPage(),
    "/guest": new GuestStoryPage(),
  };
};

export default getRoutes;
