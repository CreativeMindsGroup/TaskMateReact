import Axios from "axios";

const apiUrl = process.env.REACT_APP_API_HOST;

const api = Axios.create({
  baseURL: `${apiUrl}`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

class HttpClient {
  get(url, configs) {
    return api.get(url, configs);
  }
  post(url, data, configs) {
    return api.post(url, data, configs);
  }
  put(url, data, configs) {
    return api.put(url, data, configs);
  }
  delete(url, config) {
    return api.delete(url, config);
  }
}

export const httpClient = new HttpClient();
