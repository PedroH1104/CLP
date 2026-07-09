import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Inicio from '../screens/Tabs/Inicio';
import MeusLivros from '../screens/Tabs/MeusLivros';
import Social from '../screens/Tabs/Social';
import Perfil from '../screens/Tabs/Perfil';
import Agente from '../screens/Tabs/Agente';
import { useLogadoContext } from '../context/logadoContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { emailDoUsuario } = useLogadoContext();
  const isAdmin = emailDoUsuario?.trim().toLowerCase() === 'admin@clp.com';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'alert-circle';

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Livros') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'globe' : 'globe-outline';
          } else if (route.name === 'Agente') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#003366',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Inicio" component={Inicio} options={{ headerShown: false }} />
      <Tab.Screen name="Livros" component={MeusLivros} options={{ headerShown: false }} />
      <Tab.Screen name="Social" component={Social} options={{ headerShown: false }} />
      <Tab.Screen
        name="Agente"
        component={Agente}
        options={{
          headerShown: false,
          tabBarButton: isAdmin ? undefined : () => null,
          tabBarItemStyle: isAdmin ? undefined : { display: 'none' },
        }}
      />
      <Tab.Screen name="Perfil" component={Perfil} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
