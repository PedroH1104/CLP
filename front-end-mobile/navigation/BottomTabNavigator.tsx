import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Inicio from '../screens/Tabs/Inicio';
import MeusLivros from '../screens/Tabs/MeusLivros';
import Social from '../screens/Tabs/Social';
import Relatorio from '../screens/Tabs/Relatorio';
import Perfil from '../screens/Tabs/Perfil';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'alert-circle';

          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Livros') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'globe' : 'globe-outline';
          } else if (route.name === 'Relatório') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#003366',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Início" component={Inicio} options={{ headerShown: false }} />
      <Tab.Screen name="Livros" component={MeusLivros} options={{ headerShown: false }} />
      <Tab.Screen name="Social" component={Social} options={{ headerShown: false }} />
      {/*<Tab.Screen name="Relatório" component={Relatorio} options={{ headerShown: false }} />*/}
      <Tab.Screen name="Perfil" component={Perfil} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}