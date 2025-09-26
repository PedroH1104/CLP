import { useLogadoContext } from '../context/logadoContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importando AsyncStorage

export function Refresh() {

  const { setLogado, setUsuarioID, setImagemDoUsuario} = useLogadoContext();

  const checkLoginStatus = async () => {
    try {
      const loginData = await AsyncStorage.getItem('login');
      if (loginData) {
        const parsedData = JSON.parse(loginData);
        if (parsedData.log) {
          setLogado(true);
          setUsuarioID(parsedData.userID);
          setImagemDoUsuario(parsedData.imagem ? parsedData.imagem : undefined);
        }
      }
    } catch (error) {
      console.log('Erro ao recuperar dados do AsyncStorage:', error);
    }
  };

  checkLoginStatus();
}

export const verificarLoginSalvo = async (navigation: any, setUsuarioID: any, setNome: any, setEmailDoUsuario: any) => {
  try {
    const loginData = await AsyncStorage.getItem('login');
    if (loginData) {      
      const parsedData = JSON.parse(loginData);      
      setUsuarioID(parsedData.userID);      
      setNome(parsedData.nome);
      setEmailDoUsuario(parsedData.email);
      navigation.navigate('Main');
    } else {
      console.log("Sem dados de login salvo");
    }
  } catch (error) {
    console.error('Erro ao verificar login no AsyncStorage', error);
  }
};
