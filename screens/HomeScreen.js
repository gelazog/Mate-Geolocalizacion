import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tracking, setTracking] = useState(false);
  const navigation = useNavigation();

  const stopsData = [
    { id: '1', name: 'Parada 1 - UTT', latitude: 32.460274, longitude: -116.824994, radius: 100 },
    { id: '2', name: 'Parada 2- Calimax abejas', latitude: 32.477697, longitude: -116.861433, radius: 100 },
    { id: '3', name: 'Parada 3', latitude: 40.415575, longitude: -3.701690, radius: 100 },
  ];

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Se requiere permiso para acceder a la ubicación');
        return;
      }

      setTracking(true);
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      setInterval(async () => {
        try {
          const updatedLocation = await Location.getCurrentPositionAsync({});
          setLocation(updatedLocation);
        } catch (err) {
          setErrorMsg('Error al actualizar la ubicación: ' + err.message);
        }
      }, 20000);
    } catch (err) {
      setErrorMsg('Error al obtener la ubicación: ' + err.message);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const isNearStop = (stop) => {
    if (!location) return false;
    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      stop.latitude,
      stop.longitude
    );
    return distance <= stop.radius;
  };

  const renderStopItem = ({ item }) => {
    const isNear = isNearStop(item);

    return (
      <View style={[styles.stopItem, isNear ? styles.nearStop : styles.farStop]}>
        <Text style={styles.stopName}>{item.name}</Text>
        <Text style={styles.stopStatus}>
          {isNear ? '✅ Estás cerca!' : '❌ No estás cerca'}
        </Text>
        {location && (
          <Text style={styles.distanceText}>
            Distancia: {
              calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                item.latitude,
                item.longitude
              ).toFixed(0)
            } metros
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Tracker de Ubicación</Text>

      {!tracking ? (
        <Button
          title="Permitir acceso a la ubicación"
          onPress={requestLocationPermission}
        />
      ) : (
        <>
          <View style={styles.locationInfo}>
            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : !location ? (
              <Text>Obteniendo ubicación...</Text>
            ) : (
              <Text style={styles.coordsText}>
                Lat: {location.coords.latitude.toFixed(6)}, 
                Lon: {location.coords.longitude.toFixed(6)}
              </Text>
            )}
          </View>

          <Text style={styles.subtitle}>Puntos de parada:</Text>

          <FlatList
            data={stopsData}
            renderItem={renderStopItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />

          <View style={{ marginTop: 20 }}>
            <Button
              title="Ver mapa con ruta"
              onPress={() => navigation.navigate('Mapa')}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20,
  },
  subtitle: {
    fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, alignSelf: 'flex-start',
  },
  locationInfo: {
    marginVertical: 15, padding: 10, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 5, width: '100%', alignItems: 'center',
  },
  coordsText: {
    fontFamily: 'monospace',
  },
  errorText: {
    color: 'red',
  },
  list: {
    width: '100%',
  },
  stopItem: {
    padding: 15, borderRadius: 8, marginVertical: 8, width: '100%',
  },
  nearStop: {
    backgroundColor: '#e6ffe6', borderWidth: 1, borderColor: '#00cc00',
  },
  farStop: {
    backgroundColor: '#ffebeb', borderWidth: 1, borderColor: '#ff8080',
  },
  stopName: {
    fontSize: 16, fontWeight: 'bold',
  },
  stopStatus: {
    marginTop: 5,
  },
  distanceText: {
    marginTop: 5, fontSize: 14, color: '#555',
  },
});
