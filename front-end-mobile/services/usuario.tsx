import { Alert } from 'react-native';
import { api } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CadastraUsuarioProps, VerificaLoginProps } from '../types/Usuario';

export async function cadastraUsuario({ nome, email, senha, confirmacaoSenha, imagem, navigation, setLoading }: CadastraUsuarioProps) {    
   
    setLoading(true);

    if (senha !== confirmacaoSenha) {
        Alert.alert('Erro', 'As senhas não coincidem.');
        return;
    }    

    const novoUsuario = {
        "nome": nome,
        "email": email,
        "senha": senha,
    }

    try {
        await api.post('/usuarios', novoUsuario, { timeout: 10000 });        
        Alert.alert('Cadastro', 'Cadastro realizado com sucesso!');
        setLoading(false);
        navigation.navigate('Login');        

    } catch (error: any) {

        if (error.response) {
            Alert.alert('Erro', error.response.data.mensagem || 'Ocorreu um erro ao realizar o cadastro.');
            setLoading(false);
        } else {            
            Alert.alert('Erro', 'Erro ao conectar com o servidor.');
            setLoading(false);
        }

    }
}

export async function verificarLogin({ email, senha }: { email: string; senha: string; }) {
    try {
        const resposta = await api.post('/usuarios/verificaLogin', { email, senha }, { timeout: 10000 });
        
        // Salva os dados no AsyncStorage.
        await AsyncStorage.setItem('login', JSON.stringify({
            log: true,
            userID: resposta.data.usuario._id,
            nome: resposta.data.usuario.nome,
            email: resposta.data.usuario.email,
        }));

        // Retorna os dados do usuário para quem chamou a função.
        return resposta.data.usuario;
    } catch (error: any) {
        // Lança o erro para ser capturado no hook.
        throw error;
    }
}

