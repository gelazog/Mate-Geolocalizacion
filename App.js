import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen'; // Ensure the path is correct
import MapScreen from './screens/MapScreen';

// Ensure the Stack is correctly initialized
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Ensure the screen names and components are correctly linked */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Tracker de Ubicación' }} 
        />
        <Stack.Screen 
          name="Mapa" 
          component={MapScreen} 
          options={{ title: 'Mapa y Ruta' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
