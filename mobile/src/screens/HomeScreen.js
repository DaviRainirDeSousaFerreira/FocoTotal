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
  Platform,
  Modal,
  ScrollView,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../services/api";

export default function HomeScreen({ token }) {
  const [tarefas, setTarefas] = useState([]);

  // Campos para cadastrar uma nova tarefa
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [isMandatory, setIsMandatory] = useState(true);

  // Controle do modal de edição
  const [modalVisivel, setModalVisivel] = useState(false);
  const [idEdicao, setIdEdicao] = useState(null);

  // Campos utilizados dentro do modal
  const [tituloEdicao, setTituloEdicao] = useState("");
  const [descricaoEdicao, setDescricaoEdicao] = useState("");
  const [dataEdicao, setDataEdicao] = useState(new Date());
  const [obrigatoriaEdicao, setObrigatoriaEdicao] = useState(true);

  // Controle dos seletores de data e horário
  const [modoSeletor, setModoSeletor] = useState(null);
  const [seletorEdicao, setSeletorEdicao] = useState(false);

  const [carregando, setCarregando] = useState(true);

  const cabecalho = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Busca as tarefas cadastradas
  async function carregarTarefas() {
    try {
      const resposta = await api.get("/tasks", cabecalho);
      setTarefas(resposta.data);
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível carregar as tarefas.");
    } finally {
      setCarregando(false);
    }
  }

  // Cadastra uma nova tarefa
  async function adicionarTarefa() {
    if (!titulo.trim()) {
      Alert.alert("Atenção", "Informe o título da tarefa.");
      return;
    }

    try {
      await api.post(
        "/tasks",
        {
          title: titulo.trim(),
          description: descricao.trim(),
          scheduledFor: dataSelecionada.toISOString(),
          isMandatory: isMandatory,
        },
        cabecalho,
      );

      setTitulo("");
      setDescricao("");
      setDataSelecionada(new Date());
      setIsMandatory(true);

      Alert.alert("Sucesso", "Tarefa cadastrada!");

      carregarTarefas();
    } catch (erro) {
      const mensagem = erro.response?.data?.message;

      Alert.alert(
        "Erro",
        Array.isArray(mensagem)
          ? mensagem.join("\n")
          : mensagem || "Não foi possível cadastrar a tarefa.",
      );
    }
  }

  // Abre o modal e preenche os campos com os dados da tarefa
  function editarTarefa(tarefa) {
    setIdEdicao(tarefa.id);
    setTituloEdicao(tarefa.title);
    setDescricaoEdicao(tarefa.description || "");
    setDataEdicao(new Date(tarefa.scheduledFor));
    setObrigatoriaEdicao(tarefa.isMandatory);

    setModoSeletor(null);
    setSeletorEdicao(false);
    setModalVisivel(true);
  }

  // Salva as alterações da tarefa
  async function salvarEdicao() {
    if (!tituloEdicao.trim()) {
      Alert.alert("Atenção", "Informe o título da tarefa.");
      return;
    }

    try {
      await api.patch(
        `/tasks/${idEdicao}`,
        {
          title: tituloEdicao.trim(),
          description: descricaoEdicao.trim(),
          scheduledFor: dataEdicao.toISOString(),
          isMandatory: obrigatoriaEdicao,
        },
        cabecalho,
      );

      setModalVisivel(false);
      setModoSeletor(null);

      Alert.alert("Sucesso", "Tarefa atualizada!");

      carregarTarefas();
    } catch (erro) {
      const mensagem = erro.response?.data?.message;

      Alert.alert(
        "Erro",
        Array.isArray(mensagem)
          ? mensagem.join("\n")
          : mensagem || "Não foi possível atualizar a tarefa.",
      );
    }
  }

  // Fecha o modal sem salvar
  function cancelarEdicao() {
    setModalVisorSeguro(false);
  }

  // Exclui uma tarefa
  function excluirTarefa(id) {
    Alert.alert(
      "Excluir tarefa",
      "Tem certeza de que deseja excluir esta tarefa?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/tasks/${id}`, cabecalho);

              carregarTarefas();
            } catch (erro) {
              Alert.alert("Erro", "Não foi possível excluir a tarefa.");
            }
          },
        },
      ],
    );
  }

  // Marca uma tarefa como concluída
  async function concluirTarefa(id) {
    try {
      await api.patch(`/tasks/${id}/complete`, {}, cabecalho);
      carregarTarefas();
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível concluir a tarefa.");
    }
  }

  // Abre o seletor de data ou horário
  function abrirSeletor(modo, edicao = false) {
    setSeletorEdicao(edicao);
    setModoSeletor(modo);
  }

  // Atualiza a data ou horário selecionado
  function alterarData(evento, valor) {
    if (Platform.OS === "android") {
      setModoSeletor(null);
    }

    if (evento.type === "set" && valor) {
      if (seletorEdicao) {
        setDataEdicao(valor);
      } else {
        setDataSelecionada(valor);
      }
    }
  }

  function formatarData(data) {
    return data.toLocaleDateString("pt-BR");
  }

  function formatarHorario(data) {
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Exibe cada tarefa na lista
  function renderizarTarefa({ item }) {
    return (
      <View style={styles.cardTarefa}>
        <View style={styles.dadosTarefa}>
          <Text style={styles.tituloTarefa}>{item.title}</Text>

          {item.description ? (
            <Text style={styles.descricaoTarefa}>{item.description}</Text>
          ) : null}

          <Text style={styles.dataTarefa}>
            {new Date(item.scheduledFor).toLocaleString("pt-BR")}
          </Text>

          <Text style={styles.statusTarefa}>
            {item.isCompleted ? "Concluída" : "Pendente"}
          </Text>

          <Text style={styles.tipoTarefa}>
            {item.isMandatory ? "Obrigatória" : "Opcional"}
          </Text>

          <View style={styles.acoesTarefa}>
            <TouchableOpacity
              style={styles.botaoEditar}
              onPress={() => editarTarefa(item)}
            >
              <Text style={styles.textoBotao}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoExcluir}
              onPress={() => excluirTarefa(item.id)}
            >
              <Text style={styles.textoBotao}>Excluir</Text>
            </TouchableOpacity>
          </View>

          {!item.isCompleted && (
            <TouchableOpacity
              style={styles.botaoConcluir}
              onPress={() => concluirTarefa(item.id)}
            >
              <Text style={styles.textoBotao}>Concluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  useEffect(() => {
    carregarTarefas();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={tarefas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderizarTarefa}
        ListHeaderComponent={
          <>
            <Text style={styles.titulo}>Minhas tarefas</Text>

            <TextInput
              style={styles.input}
              placeholder="Título da tarefa"
              placeholderTextColor="#999"
              value={titulo}
              onChangeText={setTitulo}
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição (opcional)"
              placeholderTextColor="#999"
              value={descricao}
              onChangeText={setDescricao}
            />

            <Text style={styles.rotulo}>Data da tarefa</Text>

            <TouchableOpacity
              style={styles.botaoSeletor}
              onPress={() => abrirSeletor("date")}
            >
              <Text style={styles.textoSeletor}>
                {formatarData(dataSelecionada)}
              </Text>
            </TouchableOpacity>

            <Text style={styles.rotulo}>Horário da tarefa</Text>

            <TouchableOpacity
              style={styles.botaoSeletor}
              onPress={() => abrirSeletor("time")}
            >
              <Text style={styles.textoSeletor}>
                {formatarHorario(dataSelecionada)}
              </Text>
            </TouchableOpacity>

            {modoSeletor !== null && !seletorEdicao && (
              <DateTimePicker
                value={dataSelecionada}
                mode={modoSeletor}
                display="default"
                onChange={alterarData}
                is24Hour={true}
              />
            )}

            <TouchableOpacity
              style={styles.botaoObrigatoria}
              onPress={() => setIsMandatory(!isMandatory)}
            >
              <Text style={styles.textoObrigatoria}>
                {isMandatory ? "☑ Tarefa obrigatória" : "☐ Tarefa opcional"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoAdicionar}
              onPress={adicionarTarefa}
            >
              <Text style={styles.textoBotao}>Adicionar tarefa</Text>
            </TouchableOpacity>

            <Text style={styles.subtitulo}>Lista de tarefas</Text>
          </>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color="#A78BFA" />
          ) : (
            <Text style={styles.vazio}>Nenhuma tarefa cadastrada.</Text>
          )
        }
      />

      {/* Modal de edição da tarefa */}
      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelarEdicao}
      >
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.tituloModal}>Editar tarefa</Text>

              <Text style={styles.rotulo}>Título</Text>

              <TextInput
                style={styles.input}
                placeholder="Título da tarefa"
                placeholderTextColor="#999"
                value={tituloEdicao}
                onChangeText={setTituloEdicao}
              />

              <Text style={styles.rotulo}>Descrição</Text>

              <TextInput
                style={[styles.input, styles.inputDescricao]}
                placeholder="Descrição da tarefa"
                placeholderTextColor="#999"
                value={descricaoEdicao}
                onChangeText={setDescricaoEdicao}
                multiline
              />

              <Text style={styles.rotulo}>Data da tarefa</Text>

              <TouchableOpacity
                style={styles.botaoSeletor}
                onPress={() => abrirSeletor("date", true)}
              >
                <Text style={styles.textoSeletor}>
                  {formatarData(dataEdicao)}
                </Text>
              </TouchableOpacity>

              <Text style={styles.rotulo}>Horário da tarefa</Text>

              <TouchableOpacity
                style={styles.botaoSeletor}
                onPress={() => abrirSeletor("time", true)}
              >
                <Text style={styles.textoSeletor}>
                  {formatarHorario(dataEdicao)}
                </Text>
              </TouchableOpacity>

              {modoSeletor !== null && seletorEdicao && (
                <DateTimePicker
                  value={dataEdicao}
                  mode={modoSeletor}
                  display="default"
                  onChange={alterarData}
                  is24Hour={true}
                />
              )}

              <TouchableOpacity
                style={styles.botaoObrigatoria}
                onPress={() => setObrigatoriaEdicao(!obrigatoriaEdicao)}
              >
                <Text style={styles.textoObrigatoria}>
                  {obrigatoriaEdicao
                    ? "☑ Tarefa obrigatória"
                    : "☐ Tarefa opcional"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSalvar}
                onPress={salvarEdicao}
              >
                <Text style={styles.textoBotao}>Salvar alterações</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={cancelarEdicao}
              >
                <Text style={styles.textoBotao}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  titulo: {
    color: "#A78BFA",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#292640",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },

  inputDescricao: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  rotulo: {
    color: "#C4C1D4",
    marginTop: 5,
    marginBottom: 7,
  },

  botaoSeletor: {
    backgroundColor: "#292640",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  textoSeletor: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  botaoObrigatoria: {
    backgroundColor: "#292640",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  textoObrigatoria: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  botaoAdicionar: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  subtitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  cardTarefa: {
    backgroundColor: "#292640",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },

  dadosTarefa: {
    flex: 1,
  },

  tituloTarefa: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  descricaoTarefa: {
    color: "#C4C1D4",
    marginTop: 5,
  },

  dataTarefa: {
    color: "#C4C1D4",
    marginTop: 7,
  },

  statusTarefa: {
    color: "#A78BFA",
    marginTop: 8,
  },

  tipoTarefa: {
    color: "#C4C1D4",
    marginTop: 5,
  },

  acoesTarefa: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  botaoEditar: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 8,
  },

  botaoExcluir: {
    backgroundColor: "#DC2626",
    padding: 10,
    borderRadius: 8,
  },

  botaoConcluir: {
    backgroundColor: "#16A34A",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  vazio: {
    color: "#C4C1D4",
    textAlign: "center",
    marginTop: 20,
  },

  // Estilos do modal
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    padding: 20,
  },

  conteudoModal: {
    backgroundColor: "#17152B",
    borderRadius: 16,
    padding: 22,
    maxHeight: "85%",
  },

  tituloModal: {
    color: "#A78BFA",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  botaoSalvar: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  botaoCancelar: {
    backgroundColor: "#55516B",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
});
