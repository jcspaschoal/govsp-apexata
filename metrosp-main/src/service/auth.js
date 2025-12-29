import Cookies from "js-cookie";
import api from "./instance";

const endpoint = "/auth/token";

export async function login(credentials) {
  try {
    const { data } = await api.post(endpoint, credentials);
    return data;
  } catch (_) {
    return false;
  }
}

export function logout() {
  Cookies.remove("token");
  Cookies.remove("roles");
  window.location = "/";
}
