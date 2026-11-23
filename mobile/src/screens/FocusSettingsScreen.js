import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  NativeModules,
  AppState,
} from "react-native";

import api from "../services/api";

// Acessa o módulo nativo responsável pelo bloqueio no Android.
const { BlockingModule } = NativeModules;
console.log("========== TESTE BLOCKING MODULE ==========");
console.log("BlockingModule:", BlockingModule);
console.log("updateBlockingData:", BlockingModule?.updateBlockingData);
console.log(
  "isAccessibilityServiceEnabled:",
  BlockingModule?.isAccessibilityServiceEnabled,
);
console.log("===========================================");

export default function FocusSettingsScreen({ token }) {
  const [modoFoco, setModoFoco] = useState(true);
  const [aplicativos, setAplicativos] = useState([]);

  const [nomeAplicativo, setNomeAplicativo] = useState("");
  const [identificador, setIdentificador] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Informa se o serviço de acessibilidade está habilitado.
  const [acessibilidadeAtiva, setAcessibilidadeAtiva] = useState(false);

  const cabecalho = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Verifica se o serviço de acessibilidade está habilitado.
  async function verificarAcessibilidade() {
    try {
      if (!BlockingModule) {
        console.error("BlockingModule não está disponível.");
        setAcessibilidadeAtiva(false);
        return false;
      }

      const habilitado = await BlockingModule.isAccessibilityServiceEnabled();

      setAcessibilidadeAtiva(habilitado);
      return habilitado;
    } catch (erro) {
      console.error("Erro ao verificar acessibilidade:", erro);
      setAcessibilidadeAtiva(false);
      return false;
    }
  }

  // Envia as informações do bloqueio para o serviço nativo do Android.
  async function sincronizarBloqueio() {
    try {
      if (!BlockingModule) {
        console.error("BlockingModule não está disponível.");
        return;
      }

      const resposta = await api.get("/blocking-status", cabecalho);

      const aplicativosAtivos = aplicativos
        .filter((app) => app.isEnabled)
        .map((app) => app.appIdentifier);

      await BlockingModule.updateBlockingData(
        resposta.data.shouldBlock,
        aplicativosAtivos,
      );
    } catch (erro) {
      console.error("Erro ao sincronizar bloqueio:", erro);
    }
  }

  // Carrega as configurações e os aplicativos do usuário.
  async function carregarConfiguracoes() {
    try {
      const [respostaFoco, respostaApps] = await Promise.all([
        api.get("/focus-settings", cabecalho),
        api.get("/blocked-apps", cabecalho),
      ]);

      setModoFoco(respostaFoco.data.isEnabled);
      setAplicativos(respostaApps.data);

      // Verifica a permissão de acessibilidade.
      await verificarAcessibilidade();

      // Consulta o estado atual do bloqueio no backend.
      const respostaBloqueio = await api.get("/blocking-status", cabecalho);

      // Seleciona somente os aplicativos habilitados.
      const aplicativosAtivos = respostaApps.data
        .filter((app) => app.isEnabled)
        .map((app) => app.appIdentifier);

      // Envia os dados para o serviço nativo.
      if (BlockingModule) {
        await BlockingModule.updateBlockingData(
          respostaBloqueio.data.shouldBlock,
          aplicativosAtivos,
        );
      }
    } catch (erro) {
      console.error("Erro ao carregar configurações:", erro);
      Alert.alert("Erro", "Não foi possível carregar as configurações.");
    } finally {
      setCarregando(false);
    }
  }

  // Abre as configurações de acessibilidade do Android.
  async function abrirConfiguracoesAcessibilidade() {
    try {
      if (!BlockingModule) {
        Alert.alert(
          "Indisponível",
          "O módulo nativo de bloqueio não está disponível.",
        );
        return;
      }

      await BlockingModule.openAccessibilitySettings();
    } catch (erro) {
      Alert.alert(
        "Erro",
        "Não foi possível abrir as configurações de acessibilidade.",
      );
    }
  }

  // Ativa ou desativa o modo foco.
  async function alterarModoFoco(novoEstado) {
    try {
      await api.patch("/focus-settings", { isEnabled: novoEstado }, cabecalho);

      setModoFoco(novoEstado);

      // Atualiza o estado do bloqueio no Android.
      await sincronizarBloqueio();
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível alterar o modo foco.");
    }
  }

  // Cadastra um aplicativo na lista de bloqueio.
  async function adicionarAplicativo() {
    if (!nomeAplicativo.trim() || !identificador.trim()) {
      Alert.alert(
        "Atenção",
        "Preencha o nome e o identificador do aplicativo.",
      );
      return;
    }

    setSalvando(true);

    try {
      await api.post(
        "/blocked-apps",
        {
          appName: nomeAplicativo.trim(),
          appIdentifier: identificador.trim(),
        },
        cabecalho,
      );

      setNomeAplicativo("");
      setIdentificador("");

      await carregarConfiguracoes();

      Alert.alert("Sucesso", "Aplicativo cadastrado!");
    } catch (erro) {
      const mensagem = erro.response?.data?.message;

      Alert.alert(
        "Erro",
        Array.isArray(mensagem)
          ? mensagem.join("\n")
          : mensagem || "Não foi possível cadastrar o aplicativo.",
      );
    } finally {
      setSalvando(false);
    }
  }

  // Ativa ou desativa individualmente um aplicativo.
  async function alterarAplicativo(id, novoEstado) {
    try {
      await api.patch(
        `/blocked-apps/${id}`,
        { isEnabled: novoEstado },
        cabecalho,
      );

      const novaLista = aplicativos.map((app) =>
        app.id === id ? { ...app, isEnabled: novoEstado } : app,
      );

      setAplicativos(novaLista);

      // Envia a nova lista de aplicativos ao Android.
      const resposta = await api.get("/blocking-status", cabecalho);

      const aplicativosAtivos = novaLista
        .filter((app) => app.isEnabled)
        .map((app) => app.appIdentifier);

      if (BlockingModule) {
        await BlockingModule.updateBlockingData(
          resposta.data.shouldBlock,
          aplicativosAtivos,
        );
      }
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível atualizar o aplicativo.");
    }
  }

  // Exclui um aplicativo da lista.
  function excluirAplicativo(id, nome) {
    Alert.alert("Excluir aplicativo", `Deseja remover ${nome} da lista?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/blocked-apps/${id}`, cabecalho);

            const novaLista = aplicativos.filter((app) => app.id !== id);

            setAplicativos(novaLista);

            const resposta = await api.get("/blocking-status", cabecalho);

            const aplicativosAtivos = novaLista
              .filter((app) => app.isEnabled)
              .map((app) => app.appIdentifier);

            if (BlockingModule) {
              await BlockingModule.updateBlockingData(
                resposta.data.shouldBlock,
                aplicativosAtivos,
              );
            }
          } catch (erro) {
            Alert.alert("Erro", "Não foi possível excluir o aplicativo.");
          }
        },
      },
    ]);
  }

  // Exibe cada aplicativo cadastrado.
  function renderizarAplicativo({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.dadosAplicativo}>
          <Text style={styles.nomeAplicativo}>{item.appName}</Text>

          <Text style={styles.identificadorCard}>{item.appIdentifier}</Text>

          <Text style={styles.status}>
            {item.isEnabled ? "Bloqueio ativado" : "Bloqueio desativado"}
          </Text>
        </View>

        <View style={styles.acoes}>
          <Switch
            value={item.isEnabled}
            onValueChange={(valor) => alterarAplicativo(item.id, valor)}
            trackColor={{ false: "#55516B", true: "#7C3AED" }}
            thumbColor="#FFFFFF"
          />

          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={() => excluirAplicativo(item.id, item.appName)}
          >
            <Text style={styles.textoBotao}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Carrega novamente as configurações quando o usuário retorna ao app.
  useEffect(() => {
    carregarConfiguracoes();

    const inscricao = AppState.addEventListener("change", (estado) => {
      if (estado === "active") {
        verificarAcessibilidade();
        carregarConfiguracoes();
      }
    });

    return () => inscricao.remove();
  }, []);

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={aplicativos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderizarAplicativo}
        ListHeaderComponent={
          <>
            <Text style={styles.titulo}>Configurações do foco</Text>

            <View style={styles.cardFoco}>
              <View style={styles.linhaFoco}>
                <View style={styles.dadosAplicativo}>
                  <Text style={styles.nomeAplicativo}>Modo foco</Text>

                  <Text style={styles.descricao}>
                    {modoFoco
                      ? "O modo foco está ativado."
                      : "O modo foco está desativado."}
                  </Text>
                </View>

                <Switch
                  value={modoFoco}
                  onValueChange={alterarModoFoco}
                  trackColor={{ false: "#55516B", true: "#7C3AED" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.cardFoco}>
              <Text style={styles.nomeAplicativo}>Bloqueio de aplicativos</Text>

              <Text style={styles.descricao}>
                {acessibilidadeAtiva
                  ? "Permissão de acessibilidade ativada."
                  : "Ative a permissão para permitir o bloqueio de aplicativos."}
              </Text>

              {!acessibilidadeAtiva && (
                <TouchableOpacity
                  style={styles.botaoAdicionar}
                  onPress={abrirConfiguracoesAcessibilidade}
                >
                  <Text style={styles.textoBotao}>Ativar acessibilidade</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.subtitulo}>Adicionar aplicativo</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome (ex.: Instagram)"
              placeholderTextColor="#999"
              value={nomeAplicativo}
              onChangeText={setNomeAplicativo}
            />

            <TextInput
              style={styles.input}
              placeholder="Identificador (ex.: com.instagram.android)"
              placeholderTextColor="#999"
              value={identificador}
              onChangeText={setIdentificador}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.botaoAdicionar}
              onPress={adicionarAplicativo}
              disabled={salvando}
            >
              <Text style={styles.textoBotao}>
                {salvando ? "Salvando..." : "Adicionar aplicativo"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.subtitulo}>Aplicativos cadastrados</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum aplicativo cadastrado.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17152B",
    padding: 24,
    paddingTop: 60,
  },

  carregando: {
    flex: 1,
    backgroundColor: "#17152B",
    justifyContent: "center",
    alignItems: "center",
  },

  titulo: {
    color: "#A78BFA",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
  },

  subtitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 15,
  },

  cardFoco: {
    backgroundColor: "#292640",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },

  linhaFoco: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#292640",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dadosAplicativo: {
    flex: 1,
  },

  nomeAplicativo: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  identificadorCard: {
    color: "#C4C1D4",
    fontSize: 12,
    marginTop: 5,
  },

  status: {
    color: "#A78BFA",
    marginTop: 7,
    fontSize: 12,
  },

  descricao: {
    color: "#C4C1D4",
    marginTop: 5,
  },

  input: {
    backgroundColor: "#292640",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },

  botaoAdicionar: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  acoes: {
    alignItems: "center",
    marginLeft: 10,
    gap: 8,
  },

  botaoExcluir: {
    backgroundColor: "#DC2626",
    padding: 9,
    borderRadius: 8,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  vazio: {
    color: "#C4C1D4",
    textAlign: "center",
    marginTop: 20,
  },
});
