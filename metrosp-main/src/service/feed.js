import api from "./instance";

const endpoint = "/feed";
const news = "/news";
const tweets = "/twitter";

export async function getFeedNewsCob(params) {
  try {
    const data = await api.get(`${endpoint}/metrosp${params}`);
    return data;
  } catch (e) {
    return e;
  }
}

export async function getFeedNewsOlimpiadas(params) {
  try {
    const data = await api.get(`${endpoint}/linhas-privadas${params}`);
    return data;
  } catch (e) {
    return e;
  }
}

export async function getFeedNewsEsportes(params) {
  try {
    const data = await api.get(`${endpoint}/linhas-publicas${params}`);
    return data;
  } catch (e) {
    return e;
  }
}

export async function getFeedNewsInternacional(params) {
  try {
    const data = await api.get(`${endpoint}/geral${params}`);
    return data;
  } catch (e) {
    return e;
  }
}

export async function getFeedNewsImprensa(params) {
  try {
    const data = await api.get(`${endpoint}/imprensa${params}`);
    return data;
  } catch (e) {
    return e;
  }
}

export async function getFeed(params) {
  try {
    const data = await api.get(`${endpoint}${params}`);
    return data;
  } catch (e) {
    return e;
  }
}
