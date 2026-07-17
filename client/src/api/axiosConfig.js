import axios from "axios";

const API = axios.create({
  //baseURL: "http://localhost:5000"  // Local check ups
   baseURL: "https://personal-finance-app-mern.onrender.com" // <--deploying live
});

// Attach the JWT token to every request, if we have one
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says the token is invalid/expired, log the user out —
// but only redirect if we're not already on the login page, to avoid a reload loop
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;