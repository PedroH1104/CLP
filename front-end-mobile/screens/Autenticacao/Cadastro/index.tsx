import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Loading from '../../../components/Loading';
import ErrorText from '../../../components/ErrorText';
import { useCadastro } from '../../../services/hooks/useCadastro'; // Importe o novo hook
import PasswordInput from '../../../components/PasswordInput';

export default function Cadastro({ navigation }: any) {
  // Use o hook para obter todo o estado e lógica
  const { form, handleInputChange, handleCadastro, loading, errorMessage } = useCadastro(navigation);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={32} color="#003366" />
          </TouchableOpacity>
          <Text style={styles.title}>Criar Conta</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={form.nome}
              onChangeText={(text) => handleInputChange('nome', text)}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => handleInputChange('email', text)}
              autoCapitalize="none"
            />
            <PasswordInput
              placeholder="Senha"
              value={form.senha}
              onChangeText={(text) => handleInputChange('senha', text)}
            />

            <PasswordInput
              placeholder="Confirme a Senha"
              value={form.confirmacaoSenha}
              onChangeText={(text) => handleInputChange('confirmacaoSenha', text)}
            />
            {errorMessage ? <ErrorText texto={errorMessage} /> : null}
          </View>

          <View style={styles.buttonContainer}>
            {loading ? <Loading /> : (
              <TouchableOpacity style={styles.button} onPress={handleCadastro}>
                <Text style={styles.buttonText}>Cadastrar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.infoText}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}> Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#003366',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  imagePicker: {
    backgroundColor: '#FFF',
    borderColor: '#003366',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  imagePickerText: {
    color: '#003366',
    fontWeight: 'bold',
    marginLeft: 10,
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
  loginContainer: {
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
