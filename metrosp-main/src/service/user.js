import api from "./instance";

const endpoint = "/user";

export async function getUser() {
  try {
    const { data } = await api.get(endpoint);
    return data;
  } catch (_) {
    return null;
  }
}

export async function updateUser(credentials) {
  try {
    const data = await api.put(endpoint, credentials);
    return data;
  } catch (_) {
    return null;
  }
}
