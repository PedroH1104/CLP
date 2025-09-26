import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import pessoaLendo from '../../../assets/pessoaLendo.png';
import Loading from '../../../components/Loading';
import { useAuthCheck } from '../../../services/hooks/useAuthCheck'; // Importe o novo hook

export default function BemVindo({ navigation }: any) {
    const { loading } = useAuthCheck(navigation);

    if (loading) {
        return <Loading paginaInicial={true} />;
    }

    return (
        <LinearGradient colors={['#fff', '#003366']} locations={[0, 0.6]} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Bem-vindo ao CLP</Text>
                <Text style={styles.subText}>A melhor plataforma para controlar suas leituras</Text>
            </View>
            
            <ImageBackground source={pessoaLendo} style={styles.backgroundImage} imageStyle={{ opacity: 0.4 }}>
                <View style={styles.featuresContainer}>
                    <Text style={styles.featuresTitle}>Aqui você consegue:</Text>
                    <Text style={styles.featureItem}>✔ Adicionar seus livros à sua biblioteca pessoal</Text>
                    <Text style={styles.featureItem}>✔ Monitorar seu progresso de leitura</Text>
                    <Text style={styles.featureItem}>✔ Estabelecer metas personalizadas</Text>
                    <Text style={styles.featureItem}>✔ Compartilhar leituras com outros usuários</Text>
                    <Text style={styles.featureItem}>✔ Descobrir e se inspirar nas leituras de outros</Text>
                </View>
                
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                        <LinearGradient colors={['#FFFFFF', '#E0EFFF']} style={styles.button}>
                            <Text style={styles.buttonText}>Cadastre-se</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <View style={styles.loginContainer}>
                        <Text style={styles.infoText}>Já possui uma conta?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}> Entre</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
  },
  subText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#003366',
    textAlign: 'center',
    marginVertical: 15,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  featureItem: {
    fontSize: 16,
    color: '#EEE',
    marginVertical: 5,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '70%',
    alignItems: 'center',
    elevation: 5, // Sombra para destacar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#003366',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
  },
  linkText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});