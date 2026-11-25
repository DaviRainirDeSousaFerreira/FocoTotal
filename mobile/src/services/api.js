import axios from "axios";

// Configuração central da comunicação com o backend.
const api = axios.create({
  baseURL: "http://10.0.2.2:3000",
  timeout: 10000,
});

export default api;
