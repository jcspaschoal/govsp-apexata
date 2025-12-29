import axios from "axios";
import Cookies from "js-cookie";
const apiKey = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiKey,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = Cookies.get("token");
    if (token !== undefined) {
      config.headers.Authorization = "Bearer " + token;
      return config;
    } else {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
