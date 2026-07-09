import { useState } from 'react';
import { Alert } from 'react-native';
import { useLoadingContext } from '../../context/loadingContext';
import { useLogadoContext } from '../../context/logadoContext';
import { verificarLogin } from '../usuario';

export function useLogin(navigation: any) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');

    const { setLogado, setUsuarioID, setNome, setEmailDoUsuario } = useLogadoContext();
    const { loading, setLoading } = useLoadingContext();

    const handleLogin = async () => {
        const emailNormalizado = email.trim().toLowerCase();
        const senhaNormalizada = senha.trim();

        if (!emailNormalizado || !senhaNormalizada) {
            setError('Preencha todos os campos.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const dadosUsuario = await verificarLogin({
                email: emailNormalizado,
                senha: senhaNormalizada,
            });

            setUsuarioID(dadosUsuario._id);
            setLogado(true);
            setNome(dadosUsuario.nome);
            setEmailDoUsuario(dadosUsuario.email);

            setLoading(false);
            navigation.navigate('Main');
        } catch (e: any) {
            setLoading(false);

            const mensagemErro =
                e.response?.data?.mensagem ||
                (e.request
                    ? 'Nao consegui conectar com o servidor. Confira se o backend esta rodando e se o IP da API esta correto.'
                    : 'Erro ao logar. Tente novamente.');

            console.log('[Login] erro ao logar', {
                status: e.response?.status,
                mensagem: e.response?.data?.mensagem,
                baseURL: e.config?.baseURL,
                url: e.config?.url,
            });

            Alert.alert('Erro', mensagemErro);
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
