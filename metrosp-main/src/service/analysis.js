import api from "./instance";

const endpoint = "/analysis";
const news = "/news";
const tweets = "/twitter";

export async function getAnalysisById(id) {
  try {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisNewsCob() {
  try {
    const { data } = await api.get(`${endpoint}${news}/metrosp`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisNewsImprensa() {
  try {
    const { data } = await api.get(`${endpoint}${news}/imprensa`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisNewsOlimpiadas() {
  try {
    const { data } = await api.get(`${endpoint}${news}/linhas-privadas`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisNewsInternacional() {
  try {
    const { data } = await api.get(`${endpoint}${news}/geral `);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisNewsEsportes() {
  try {
    const { data } = await api.get(`${endpoint}${news}/linhas-publicas`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisTweetsCob() {
  try {
    const { data } = await api.get(`${endpoint}${tweets}/metrosp`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisTweetsImprensa() {
  try {
    const { data } = await api.get(`${endpoint}${tweets}/imprensa`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisTweetsOlimpiadas() {
  try {
    const { data } = await api.get(`${endpoint}${tweets}/linhas-privadas`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisTweetsInternacional() {
  try {
    const { data } = await api.get(`${endpoint}${tweets}/geral`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisTweetsByDate(params) {
  try {
    const { data } = await api.get(`${endpoint}${params}`);
    return data;
  } catch (_) {
    return null;
  }
}

export async function getAnalysisTweetsEsportes() {
  try {
    const { data } = await api.get(`${endpoint}${tweets}/linhas-publicas`);
    return data;
  } catch (_) {
    return null;
  }
}
