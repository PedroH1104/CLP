import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
  InteractionManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageStructure from '../../../components/PageStructure';
import { useLogadoContext } from '../../../context/logadoContext';
import { api } from '../../../api/api';
import { useLoadingContext } from '../../../context/loadingContext';
import Loading from '../../../components/Loading';

export default function Perfil({ navigation }: any) {
  const {
    emailDoUsuario,
    nome,
    usuarioID,
    setEmailDoUsuario,
    setImagemDoUsuario,
    setListaSugestoes,
    setLivros,
    setLogado,
    setMetasDeLivros,
    setNome,
    setPosts,
    setUsuarioID,
  } = useLogadoContext();
  const { loading, setLoading } = useLoadingContext();

  const [isEditable, setIsEditable] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(emailDoUsuario || '');
  const [currentName, setCurrentName] = useState(nome || '');
  const [saindo, setSaindo] = useState(false);

  const limparSessao = () => {
    setLogado(false);
    setUsuarioID(undefined);
    setNome('');
    setEmailDoUsuario('');
    setImagemDoUsuario(undefined);
    setLivros([]);
    setPosts([]);
    setListaSugestoes([]);
    setMetasDeLivros([]);
  };

  const handleLogout = async () => {
    if (saindo) return;

    setSaindo(true);

    try {
      await AsyncStorage.removeItem('login');

      const rootNavigation =
        navigation.getParent?.()?.getParent?.() ||
        navigation.getParent?.() ||
        navigation;

      rootNavigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });

      InteractionManager.runAfterInteractions(limparSessao);
    } catch (error) {
      console.error('Erro ao sair da conta', error);
      setSaindo(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await api.put(`/usuarios/${usuarioID}`, {
        nome: currentName,
        email: currentEmail,
      });
      console.log('Alteracoes salvas com sucesso:', response.data);

      setNome(currentName);
      setEmailDoUsuario(currentEmail);

      const loginData = await AsyncStorage.getItem('login');
      if (loginData) {
        const parsedData = JSON.parse(loginData);
        await AsyncStorage.setItem(
          'login',
          JSON.stringify({
            ...parsedData,
            nome: currentName,
            email: currentEmail,
          })
        );
      }

      setIsEditable(false);
    } catch (error) {
      console.error('Erro ao salvar as alteracoes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageStructure title="Perfil" icon="person">
      <View style={styles.container}>
        <Text style={styles.title}>Seus dados</Text>
        <View style={styles.switchContainer}>
          <Switch
            value={isEditable}
            onValueChange={setIsEditable}
            thumbColor={isEditable ? '#003366' : '#ccc'}
          />
          <Text style={styles.switchLabel}>Editar Informacoes</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={[styles.input, !isEditable && styles.inputDisabled]}
            value={currentName}
            onChangeText={setCurrentName}
            editable={isEditable}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !isEditable && styles.inputDisabled]}
            value={currentEmail}
            onChangeText={setCurrentEmail}
            editable={isEditable}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {isEditable &&
          (loading ? (
            <View style={styles.loadingContainer}>
              <Loading />
            </View>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar Informacoes</Text>
            </TouchableOpacity>
          ))}

        {!isEditable && (
          <TouchableOpacity
            style={[styles.logoutButton, saindo && styles.disabledButton]}
            onPress={handleLogout}
            disabled={saindo}
          >
            <Text style={styles.logoutButtonText}>{saindo ? 'Saindo...' : 'Sair'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </PageStructure>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  switchContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#003366',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  loadingContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#003366',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
