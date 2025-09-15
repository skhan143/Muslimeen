import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Stripe Product ID: prod_St2qhu5QB5sjjy
const DONATE_URL = 'https://donate.stripe.com/test_6oUaEQ7Vx8AMb8s5gN1RC00'; // Stripe payment link

const DonateUs: React.FC = () => {
  const handleDonate = () => {
    Linking.openURL(DONATE_URL);
  };

  return (
    <LinearGradient
      colors={["#00515f", "#368a95"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.card}>
        <Ionicons name="heart-outline" size={48} color="#ffd700" style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Support Qalby Muslim</Text>
        <Text style={styles.desc}>
          Help us keep improving and serving the community. Your donation makes a difference!
        </Text>
        <TouchableOpacity style={styles.donateBtn} onPress={handleDonate}>
          <Ionicons name="card-outline" size={22} color="#fff" />
          <Text style={styles.donateBtnText}>Donate Now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#00515f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    borderWidth: 2,
    borderColor: '#ffd700',
    width: '100%',
    maxWidth: 380,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: '#00515f',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  desc: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500',
  },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd700',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
    shadowColor: '#00515f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  donateBtnText: {
    color: '#00515f',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
});

export default DonateUs;
