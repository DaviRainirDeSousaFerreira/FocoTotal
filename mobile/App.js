import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import FocusSettingsScreen from "./src/screens/FocusSettingsScreen";

export default function App() {
  const [token, setToken] = useState(null);
  const [telaAtual, setTelaAtual] = useState("tarefas");

  if (!token) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onLoginSuccess={setToken} />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.navegacao}>
        <TouchableOpacity
          style={[
            styles.botaoNavegacao,
            telaAtual === "tarefas" && styles.botaoSelecionado,
          ]}
          onPress={() => setTelaAtual("tarefas")}
        >
          <Text style={styles.textoNavegacao}>Minhas tarefas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoNavegacao,
            telaAtual === "configuracoes" && styles.botaoSelecionado,
          ]}
          onPress={() => setTelaAtual("configuracoes")}
        >
          <Text style={styles.textoNavegacao}>Configurações</Text>
        </TouchableOpacity>
      </View>

      {telaAtual === "tarefas" ? (
        <HomeScreen token={token} />
      ) : (
        <FocusSettingsScreen token={token} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17152B",
  },

  navegacao: {
    flexDirection: "row",
    backgroundColor: "#292640",
    paddingTop: 45,
    paddingBottom: 10,
    paddingHorizontal: 12,
    gap: 10,
  },

  botaoNavegacao: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  botaoSelecionado: {
    backgroundColor: "#7C3AED",
  },

  textoNavegacao: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
