import { useEffect } from 'react';
import { useLogadoContext } from '@/contexts/LogadoContext';

export function Refresh() {
    const { setLogado, setUsuarioID, setImagemDoUsuario } = useLogadoContext();     

    useEffect(() => {
        const loginData = JSON.parse(localStorage.getItem("login") || "{}");
        if (loginData && loginData.log) {
            setLogado(true);
            setUsuarioID(loginData.userID);
            setImagemDoUsuario(loginData.imagem ? loginData.imagem : undefined);  
        }                 
    }, [setLogado, setUsuarioID, setImagemDoUsuario]);
}