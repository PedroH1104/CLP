import { useState } from 'react';
import { useLoadingContext } from '../../context/loadingContext';
import { useLogadoContext } from '../../context/logadoContext';
import { verificarLogin } from '../usuario';
import { Alert } from 'react-native'; // Adicionar o import do Alert

export function useLogin(navigation: any) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    
    const { setLogado, setUsuarioID, setNome, setEmailDoUsuario } = useLogadoContext();
    const { loading, setLoading } = useLoadingContext();

    const handleLogin = async () => {
        if (!email || !senha) {
            setError('Preencha todos os campos.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            // Chama a nova função simplificada e obtém os dados do usuário.
            const dadosUsuario = await verificarLogin({ email, senha });

            // A lógica de atualização do estado global agora fica no hook
            setUsuarioID(dadosUsuario._id);
            setLogado(true);
            setNome(dadosUsuario.nome);
            setEmailDoUsuario(dadosUsuario.email);

            setLoading(false);
            navigation.navigate("Main");
        } catch (e: any) {
            setLoading(false);
            const mensagemErro = e.response?.data?.mensagem || 'Erro ao logar. Tente novamente.';
            Alert.alert('Erro', mensagemErro); // Use o Alert para o usuário
        }
    };

    return {
        email,
        senha,
        error,
        loading,
        setEmail,
        setSenha,
        handleLogin,
    };
}