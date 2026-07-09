import { useEffect, useRef, useState } from 'react';
import { useLogadoContext } from '../../context/logadoContext';
import { verificarLoginSalvo } from '../Refresh';

export function useAuthCheck(navigation: any) {
    const [loading, setLoading] = useState(true);
    const jaVerificouLogin = useRef(false);
    const { setUsuarioID, setNome, setEmailDoUsuario } = useLogadoContext();

    useEffect(() => {
        if (jaVerificouLogin.current) {
            return;
        }

        jaVerificouLogin.current = true;

        const checkLogin = async () => {
            await verificarLoginSalvo(navigation, setUsuarioID, setNome, setEmailDoUsuario);
            setLoading(false);
        };

        checkLogin();
    }, []);

    return { loading };
}
