import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBuAjMS_UH8pCAJKcpxTwkbzg6iItU4xMc'; 

const stopsData = [
  { id: '1', name: 'Parada 1 - UTT', latitude: 32.460274, longitude: -116.824994 },
  { id: '2', name: 'Parada 2 - Calimax abejas', latitude: 32.477697, longitude: -116.861433 },
  { id: '3', name: 'Parada - Te sientas', latitude: 40.415575, longitude: -3.701690 },
];

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [closestStop, setClosestStop] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

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

  const findClosestStop = (coords) => {
    let minDistance = Infinity;
    let closest = null;

    stopsData.forEach((stop) => {
      const dist = calculateDistance(coords.latitude, coords.longitude, stop.latitude, stop.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = stop;
      }
    });

    return closest;
  };

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
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos denegados', 'Se necesita permiso para acceder a la ubicación.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = loc.coords;
      setLocation(coords);

      const closest = findClosestStop(coords);
      setClosestStop(closest);

      if (closest) {
        fetchRoute(coords, closest);
      }
    })();
  }, []);

  if (!location || !closestStop) {
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
          coordinate={{ latitude: closestStop.latitude, longitude: closestStop.longitude }}
          title={closestStop.name}
          description="Parada más cercana"
        />

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="#1E90FF"
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
