import { useState } from 'react';
import { useLoadingContext } from '../../context/loadingContext';
import { cadastraUsuario } from '../usuario';

export function useCadastro(navigation: any) {
  const { loading, setLoading } = useLoadingContext();
  const [errorMessage, setErrorMessage] = useState('');
  
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmacaoSenha: '',
    imagem: null as string | null,
  });

  const handleInputChange = (field: string, value: string) => {
    setForm(prevForm => ({ ...prevForm, [field]: value }));
  };

  const handleCadastro = () => {    
    if (!form.nome || !form.email || !form.senha || !form.confirmacaoSenha) {
      setErrorMessage('Preencha todos os campos obrigatórios!');
      return;
    }

    if (form.senha !== form.confirmacaoSenha) {
      setErrorMessage('As senhas não coincidem!');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    
    cadastraUsuario({ ...form, navigation, setLoading });  };

  
  return {
    form,
    handleInputChange,
    handleCadastro,
    loading,
    errorMessage,
    setErrorMessage,
  };
}