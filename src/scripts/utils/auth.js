export const isUnLoggedIn = () => {
  const token = localStorage.getItem("token");
  return !token; // Mengembalikan true jika token tidak ada (guest), false jika token ada (sudah login)
};
