import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Loading from '../../../components/Loading';
import ErrorText from '../../../components/ErrorText';
import { useLogin } from '../../../services/hooks/useLogin'; // Importe o novo hook
import PasswordInput from '../../../components/PasswordInput';

export default function Login({ navigation }: any) {
  // Use o hook para obter todo o estado e lógica
  const { email, senha, error, loading, setEmail, setSenha, handleLogin } = useLogin(navigation);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={32} color="#003366" />
      </TouchableOpacity>
      <Text style={styles.title}>Entrar</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <PasswordInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
        />
        {error ? <ErrorText texto={error} /> : null}
      </View>
      <View style={styles.buttonContainer}>
        {loading ? (
          <Loading />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.registerContainer}>
        <Text style={styles.infoText}>Não tem uma conta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.linkText}> Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  button: {
    backgroundColor: '#003366',
    padding: 15,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  linkText: {
    color: '#003366',
    fontWeight: 'bold',
  },
});