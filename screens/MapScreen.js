import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBuAjMS_UH8pCAJKcpxTwkbzg6iItU4xMc'; 

export default function MapScreen() {
  const route = useRoute();
  const selectedStop = route.params?.stop;

  const [location, setLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const fetchRoute = async (origin, destination) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);
      const points = decodePolyline(response.data.routes[0].overview_polyline.points);
      setRouteCoords(points);
    } catch (err) {
      Alert.alert('Error', 'No se pudo obtener la ruta.');
    }
  };

  const decodePolyline = (t, e = 5) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < t.length) {
      let b, shift = 0, result = 0;

      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  useEffect(() => {
    (async () => {
      if (!selectedStop) {
        Alert.alert('Error', 'No se proporcionó parada');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos denegados', 'Se necesita acceso a la ubicación.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      fetchRoute(loc.coords, selectedStop);
    })();
  }, []);

  if (!location || !selectedStop) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Cargando mapa y ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: selectedStop.latitude, longitude: selectedStop.longitude }}
          title={selectedStop.name}
          description="Parada seleccionada"
        />

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="#007AFF"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
