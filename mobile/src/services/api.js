import axios from "axios";

// Configuração central da comunicação com o backend.
const api = axios.create({
  baseURL: "http://192.168.1.108:3000",
  timeout: 10000,
});

export default api;
