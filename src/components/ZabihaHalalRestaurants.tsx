


import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ZabihaHalalRestaurants: React.FC = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => Linking.openURL('https://tally.so/r/mKEDQk')}
      >
        <MaterialIcons name="add-business" size={22} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.addButtonText}>Add your restaurant</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 8 }}>
        <MaterialIcons name="location-on" size={32} color="#007aff" style={{ marginRight: 8 }} />
        <Text style={styles.heading}>Zabiha Halal Restaurants</Text>
      </View>
      <View style={styles.comingSoonContainer}>
        <MaterialIcons name="hourglass-empty" size={48} color="#007aff" style={{ marginBottom: 8 }} />
        <Text style={styles.comingSoonText}>Coming Soon!</Text>
        <Text style={styles.subheading}>We're working hard to bring you a list of Zabiha Halal restaurants near you. In the meantime, add your restaurant using the button above.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'center',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingBottom: 64,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  // Search bar styles removed
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginVertical: 12,
    marginHorizontal: 8,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    width: 340,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  comingSoonContainer: {
    alignItems: 'center',
    marginTop: 32,
    padding: 24,
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#b3e0ff',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  comingSoonText: {
    color: '#007aff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  restaurantInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  restaurantLink: {
    fontSize: 14,
    color: '#007aff',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});

export default ZabihaHalalRestaurants;
