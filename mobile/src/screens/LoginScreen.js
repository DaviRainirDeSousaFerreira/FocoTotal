import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import api from "../services/api";

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function realizarLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Atenção", "Preencha o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);

      const resposta = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      onLoginSuccess(resposta.data.access_token);
    } catch (erro) {
      const mensagem = erro.response?.data?.message;

      Alert.alert(
        "Erro no login",
        Array.isArray(mensagem)
          ? mensagem.join("\n")
          : mensagem || "Não foi possível conectar ao servidor.",
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>FocoTotal</Text>

      <Text style={styles.subtitulo}>
        Organize suas tarefas. Concentre-se no que importa.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={realizarLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBotao}>Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17152B",
    justifyContent: "center",
    padding: 28,
  },
  logo: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#A78BFA",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitulo: {
    color: "#C4C1D4",
    textAlign: "center",
    marginBottom: 40,
    fontSize: 15,
  },
  input: {
    backgroundColor: "#292640",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  botao: {
    backgroundColor: "#7C3AED",
    padding: 17,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
