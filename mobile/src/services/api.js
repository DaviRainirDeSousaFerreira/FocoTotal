import axios from "axios";
import * as Device from "expo-device";

// Identifica automaticamente o ambiente de execução.
const enderecoAPI = Device.isDevice
  ? process.env.EXPO_PUBLIC_API_URL
  : "http://10.0.2.2:3000";

// Verifica se o endereço da API foi configurado.
if (!enderecoAPI) {
  throw new Error("Endereço da API não configurado no arquivo .env");
}

// Configuração central da comunicação com o backend.
const api = axios.create({
  baseURL: enderecoAPI,
  timeout: 10000,
});

export default api;
