import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainLogicScreen from './screens/MainLogicScreen';
import MapScreen from './screens/MapScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainLogic">
        <Stack.Screen name="MainLogic" component={MainLogicScreen} options={{ title: 'Seleccionar Ruta' }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Ruta hacia la parada' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
