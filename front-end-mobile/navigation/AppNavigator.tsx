import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator'; // Importe o novo componente
import BemVindo from '../screens/Autenticacao/BemVindo';
import Cadastro from '../screens/Autenticacao/Cadastro';
import LoginScreen from '../screens/Autenticacao/Login';
import { LogadoProvider } from '../context/logadoContext';
import { LoadingProvider } from '../context/loadingContext';
import { ModalProvider } from '../context/modalContext';

const Stack = createStackNavigator();

export default function AppNavigator() {

  return (
    <ModalProvider>
      <LoadingProvider>
        <LogadoProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Inicio" component={BemVindo} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: false }} />
              <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </LogadoProvider>
      </LoadingProvider>
    </ModalProvider>
  );
}