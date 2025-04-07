

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  // Estados principales
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('loading'); // 'loading', 'routeSelection', 'stops'
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [distanceLimit, setDistanceLimit] = useState(null); // null = todas, o un número en km
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Opciones de límites de distancia en km
  const distanceLimits = [
    { value: 1, label: '1 km' },
    { value: 3, label: '3 km' },
    { value: 5, label: '5 km' },
    { value: 20.20, label: '20 km' },
    { value: null, label: 'Todas las paradas' }
  ];

  // Datos de rutas y paradas en formato JSON
const routesData = {
  routes: [
    {
      id: "route1",
      name: "Ruta Florido",
      stops: [
        { id: "stop1", name: "Parada Florido - Av. Florido", latitude: 32.5200, longitude: -117.0450 },
        { id: "stop2", name: "Parada UTT - Campus UTT", latitude: 32.5250, longitude: -117.0480 },
        { id: "stop3", name: "Parada Florido - Centro de Atención", latitude: 32.5210, longitude: -117.0440 },
        { id: "stop4", name: "Parada Florido - Terminal", latitude: 32.5220, longitude: -117.0430 }
      ]
    },
    {
      id: "route2",
      name: "Ruta Morita",
      stops: [
        { id: "stop5", name: "Parada Morita - Av. Morita", latitude: 32.5170, longitude: -117.0410 },
        { id: "stop6", name: "Parada Morita - Calimax Las Abejas", latitude: 32.5165, longitude: -117.0405 },
        { id: "stop7", name: "Parada Morita - Esquina Morita", latitude: 32.5180, longitude: -117.0400 },
        { id: "stop8", name: "Parada Morita - Centro Comercial", latitude: 32.5190, longitude: -117.0390 }
      ]
    },
    {
      id: "route3",
      name: "Ruta Centro/Otay",
      stops: [
        { id: "stop9", name: "Parada Centro - Plaza Constitución", latitude: 32.5149, longitude: -117.0382 },
        { id: "stop10", name: "Parada Centro - Av. Revolución", latitude: 32.5135, longitude: -117.0370 },
        { id: "stop11", name: "Parada Otay - Terminal Otay", latitude: 32.5110, longitude: -117.0350 },
        { id: "stop12", name: "Parada Centro - Otra Parada", latitude: 32.5150, longitude: -117.0360 }
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
    const x = lat2 - lat1;
    const y = lon2 - lon1;
    return Math.sqrt(x * x + y * y);
  };

  // Convertir distancia en grados a kilómetros (aproximado)
  const convertToKm = (distance) => {
    // Factor aproximado: 111.32 km = 1 grado en latitud
    return distance * 111.32;
  };

  // Obtener paradas ordenadas y filtradas por distancia
  const getFilteredStops = () => {
    if (!selectedRoute || !selectedRoute.stops) return [];
    
    // Si no hay ubicación, devolver las paradas sin filtrar
    if (!location) return selectedRoute.stops;
    
    // Ordenar paradas por distancia
    const sortedStops = [...selectedRoute.stops].sort((a, b) => {
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
    
    // Si no hay límite, devolver todas las paradas ordenadas
    if (distanceLimit === null) return sortedStops;
    
    // Filtrar paradas que estén dentro del límite de distancia
    return sortedStops.filter(stop => {
      const dist = calculateEuclideanDistance(
        location.coords.latitude, location.coords.longitude,
        stop.latitude, stop.longitude
      );
      
      return convertToKm(dist) <= distanceLimit;
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

  // Mostrar modal de selección de límite
  const toggleLimitModal = () => {
    setShowLimitModal(!showLimitModal);
  };

  // Seleccionar un límite de distancia
  const selectDistanceLimit = (limit) => {
    setDistanceLimit(limit);
    setShowLimitModal(false);
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
      
    const distanceInKm = convertToKm(distance);
    
    return (
      <View style={[
        styles.stopItem,
        index === 0 ? styles.closestStop : null
      ]}>
        <Text style={styles.stopName}>{item.name}</Text>
        {index === 0 && <Text style={styles.closestLabel}>¡Más cercana!</Text>}
        {location && (
          <Text style={styles.distanceText}>
            Distancia: {distanceInKm.toFixed(2)} km
          </Text>
        )}
        <Text style={styles.coordsText}>
          Lat: {item.latitude.toFixed(6)}, Lon: {item.longitude.toFixed(6)}
        </Text>
      </View>
    );
  };

  // Modal para seleccionar el límite de distancia
  const renderLimitModal = () => (
    <Modal
      visible={showLimitModal}
      transparent={true}
      animationType="slide"
      onRequestClose={toggleLimitModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecciona límite de distancia</Text>
          
          {distanceLimits.map((limit) => (
            <TouchableOpacity
              key={limit.label}
              style={[
                styles.limitOption,
                distanceLimit === limit.value ? styles.selectedLimit : null
              ]}
              onPress={() => selectDistanceLimit(limit.value)}
            >
              <Text style={styles.limitOptionText}>{limit.label}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={toggleLimitModal}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
  const filteredStops = getFilteredStops();
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToRoutes} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.routeTitle}>{selectedRoute.name}</Text>
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterText}>
          Límite de distancia: {distanceLimit ? `${distanceLimit} km` : 'Todas las paradas'}
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleLimitModal}
        >
          <Text style={styles.filterButtonText}>Cambiar límite</Text>
        </TouchableOpacity>
      </View>
      
      {filteredStops.length > 0 ? (
        <>
          <Text style={styles.subtitle}>
            Paradas ordenadas por cercanía
            {distanceLimit ? ` (hasta ${distanceLimit} km)` : ''}:
          </Text>
          
          <FlatList
            data={filteredStops}
            renderItem={renderStopItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
        </>
      ) : (
        <View style={styles.noStopsContainer}>
          <Text style={styles.noStopsText}>
            No hay paradas dentro del límite de {distanceLimit} km.
          </Text>
          <Text style={styles.noStopsSubtext}>
            Intenta aumentar el límite de distancia.
          </Text>
        </View>
      )}
      
      {renderLimitModal()}
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
    marginBottom: 10,
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterText: {
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '500',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  limitOption: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  selectedLimit: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  limitOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    padding: 15,
    marginTop: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  noStopsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noStopsText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  noStopsSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});