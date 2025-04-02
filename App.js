import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  // Estados principales
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('loading'); // 'loading', 'routeSelection', 'stops'
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Datos de rutas y paradas en formato JSON
  const routesData = {
    routes: [
      {
        id: "route1",
        name: "Ruta Centro",
        stops: [
          { id: "stop1", name: "Parada Principal", latitude: 40.416775, longitude: -3.703790 },
          { id: "stop2", name: "Plaza Mayor", latitude: 40.415551, longitude: -3.707397 },
          { id: "stop3", name: "Gran Vía", latitude: 40.420161, longitude: -3.705752 },
        ]
      },
      {
        id: "route2",
        name: "Ruta Norte",
        stops: [
          { id: "stop4", name: "Nuevos Ministerios", latitude: 40.446478, longitude: -3.692394 },
          { id: "stop5", name: "Chamartín", latitude: 40.472054, longitude: -3.683519 },
          { id: "stop6", name: "Plaza Castilla", latitude: 40.466765, longitude: -3.689160 },
        ]
      },
      {
        id: "route3",
        name: "Ruta Sur",
        stops: [
          { id: "stop7", name: "Atocha", latitude: 40.406514, longitude: -3.691833 },
          { id: "stop8", name: "Legazpi", latitude: 40.391347, longitude: -3.699687 },
          { id: "stop9", name: "Villaverde", latitude: 40.347008, longitude: -3.700428 },
        ]
      }
    ]
  };

  // Al cargar la app, solicitar permisos de ubicación inmediatamente
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Función para solicitar permiso y obtener ubicación
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Se requiere permiso para acceder a la ubicación');
        setCurrentScreen('routeSelection'); // Avanzamos de todas formas a selección de ruta
        return;
      }

      // Obtener ubicación inicial
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Configurar seguimiento continuo
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );
      
      // Cambiar a pantalla de selección de ruta
      setCurrentScreen('routeSelection');
      
    } catch (err) {
      setErrorMsg('Error al obtener la ubicación: ' + err.message);
      setCurrentScreen('routeSelection'); // Avanzamos de todas formas
    }
  };

  // Calcular distancia euclidiana entre dos puntos
  const calculateEuclideanDistance = (lat1, lon1, lat2, lon2) => {
    // Simplificamos usando distancia euclidiana directa entre coordenadas
    // Esto es una aproximación para distancias cortas
    const x = lat2 - lat1;
    const y = lon2 - lon1;
    return Math.sqrt(x * x + y * y);
  };

  // Ordenar paradas por cercanía al usuario
  const sortStopsByDistance = (stops) => {
    if (!location) return stops;
    
    return [...stops].sort((a, b) => {
      const distA = calculateEuclideanDistance(
        location.coords.latitude, location.coords.longitude,
        a.latitude, a.longitude
      );
      
      const distB = calculateEuclideanDistance(
        location.coords.latitude, location.coords.longitude,
        b.latitude, b.longitude
      );
      
      return distA - distB;
    });
  };

  // Seleccionar una ruta
  const selectRoute = (route) => {
    setSelectedRoute(route);
    setCurrentScreen('stops');
  };

  // Volver a la selección de rutas
  const goBackToRoutes = () => {
    setSelectedRoute(null);
    setCurrentScreen('routeSelection');
  };

  // Renderizar cada ruta disponible
  const renderRouteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.routeItem}
      onPress={() => selectRoute(item)}
    >
      <Text style={styles.routeName}>{item.name}</Text>
      <Text style={styles.routeStopsCount}>{item.stops.length} paradas</Text>
    </TouchableOpacity>
  );

  // Renderizar cada parada en la ruta seleccionada
  const renderStopItem = ({ item, index }) => {
    const distance = location ? 
      calculateEuclideanDistance(
        location.coords.latitude, location.coords.longitude,
        item.latitude, item.longitude
      ) : 0;
      
    // Convertir la distancia (en grados) a una distancia aproximada en kilómetros
    // Factor aproximado: 111.32 km = 1 grado en latitud
    const distanceInKm = distance * 111.32;
    
    return (
      <View style={[
        styles.stopItem,
        index === 0 ? styles.closestStop : null
      ]}>
        <Text style={styles.stopName}>{item.name}</Text>
        {index === 0 && <Text style={styles.closestLabel}>¡Más cercana!</Text>}
        {location && (
          <Text style={styles.distanceText}>
            Distancia aproximada: {distanceInKm.toFixed(2)} km
          </Text>
        )}
        <Text style={styles.coordsText}>
          Lat: {item.latitude.toFixed(6)}, Lon: {item.longitude.toFixed(6)}
        </Text>
      </View>
    );
  };

  // Pantalla de carga inicial
  if (currentScreen === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Solicitando permisos de ubicación...</Text>
      </View>
    );
  }

  // Pantalla de selección de ruta
  if (currentScreen === 'routeSelection') {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        
        <Text style={styles.title}>Selecciona una Ruta</Text>
        
        {errorMsg && (
          <Text style={styles.errorText}>{errorMsg}</Text>
        )}
        
        {location && (
          <Text style={styles.locationText}>
            Tu ubicación: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
          </Text>
        )}
        
        <FlatList
          data={routesData.routes}
          renderItem={renderRouteItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      </View>
    );
  }

  // Pantalla de paradas de la ruta seleccionada
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToRoutes} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.routeTitle}>{selectedRoute.name}</Text>
      </View>
      
      <Text style={styles.subtitle}>Paradas ordenadas por cercanía:</Text>
      
      <FlatList
        data={sortStopsByDistance(selectedRoute.stops)}
        renderItem={renderStopItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  locationText: {
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  list: {
    width: '100%',
  },
  routeItem: {
    backgroundColor: '#e6f7ff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#b3e0ff',
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeStopsCount: {
    marginTop: 5,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  routeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  stopItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  closestStop: {
    backgroundColor: '#e6ffe6',
    borderColor: '#00cc00',
    borderWidth: 2,
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closestLabel: {
    color: '#009900',
    fontWeight: 'bold',
    marginTop: 5,
  },
  distanceText: {
    marginTop: 5,
    fontSize: 14,
  },
  coordsText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});