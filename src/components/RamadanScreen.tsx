import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

const RamadanScreen = () => {
  const [ramadanTimings, setRamadanTimings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimings = async () => {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission not granted");
        }

        // Get user's location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Use aladhan API to get Ramadan timings
        const response = await axios.get(
          `https://api.aladhan.com/v1/calendar?latitude=${latitude}&longitude=${longitude}&method=2&month=9&year=2024`
        );

        setRamadanTimings(response.data.data[0].timings);
      } catch (error) {
        console.error("Error fetching Ramadan timings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimings();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {ramadanTimings && (
        <>
          <Text>Suhoor: {ramadanTimings.Fajr}</Text>
          <Text>Iftar: {ramadanTimings.Isha}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RamadanScreen;
