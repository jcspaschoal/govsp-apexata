import api from "./instance";

const endpoint = "/review";

export async function getReview(id) {
  try {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  } catch (_) {
    return null;
  }
}


export async function postReview(review) {
  try {
    const data = await api.post(endpoint, review);
    return data;
  } catch (_) {
    return null;
  }
}

export async function updateReview(review) {
  try {
    const data = await api.put(endpoint, review);
    return data;
  } catch (_) {
    return null;
  }
}

export async function deleteReview(id) {
  try {
    const data = await api.delete(`${endpoint}/${id}`);
    return data;
  } catch (_) {
    return null;
  }
}
