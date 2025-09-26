import { useEffect, useState } from 'react';
import { useLogadoContext } from '../../context/logadoContext';
import { verificarLoginSalvo } from '../Refresh';

export function useAuthCheck(navigation: any) {
    const [loading, setLoading] = useState(true);
    const { setUsuarioID, setNome, setEmailDoUsuario } = useLogadoContext();

    useEffect(() => {
        const checkLogin = async () => {
            await verificarLoginSalvo(navigation, setUsuarioID, setNome, setEmailDoUsuario);
            
            setLoading(false);
        };
        checkLogin();
    }, [navigation, setUsuarioID, setNome, setEmailDoUsuario]);

    return { loading };
}