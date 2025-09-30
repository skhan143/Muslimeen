import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ZakatCalculator from './ZakatCalculator';
import ScrollTasbih from './ScrollTasbih';
import ZabihaHalalRestaurants from './ZabihaHalalRestaurants';
import DonateUs from './DonateUs';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Theme colors (matching App.tsx)
const theme = {
  primary: '#00515f',
  secondary: '#368a95',
  accent: '#e74c3c',
  background: '#eaf6fb',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  white: '#ffffff',
  border: '#e0e0e0',
  shadow: '#000000',
};

const MoreScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeScreen, setActiveScreen] = useState<'more' | 'tasbih' | 'zabiha' | 'zakat' | 'donate'>('more');

  // --- More Menu ---
  if (activeScreen === 'more') {
    return (
      <LinearGradient
        colors={["#eaf6fb", "#ffffff", "#368a95"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={[styles.centeredContainer]}> 
          <LinearGradient
            colors={["#ffffffCC", "#eaf6fbCC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 18, padding: 18, margin: 18 }}
          >
            <BlurView intensity={60} tint="light" style={{ borderRadius: 18 }}>
              <Text style={styles.moreTitle}>More</Text>
              <View style={styles.centeredMenuList}>
                <TouchableOpacity style={styles.moreMenuButton} onPress={() => setActiveScreen('tasbih')}>
                  <Ionicons name="repeat-outline" size={28} color={theme.primary} style={{ marginBottom: 6 }} />
                  <Text style={styles.moreMenuText}>Scroll Tasbih</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreMenuButton} onPress={() => setActiveScreen('zabiha')}>
                  <Ionicons name="restaurant-outline" size={28} color={theme.primary} style={{ marginBottom: 6 }} />
                  <Text style={styles.moreMenuText}>Zabiha Halal Restaurants</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreMenuButton} onPress={() => setActiveScreen('zakat')}>
                  <Ionicons name="calculator-outline" size={28} color={theme.primary} style={{ marginBottom: 6 }} />
                  <Text style={styles.moreMenuText}>Zakat Calculator</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreMenuButton} onPress={() => setActiveScreen('donate')}>
                  <Ionicons name="heart-outline" size={28} color={theme.primary} style={{ marginBottom: 6 }} />
                  <Text style={styles.moreMenuText}>Donate Us</Text>
                </TouchableOpacity>
                {/* Family Routine removed for v1 (moved to experimental) */}
                <TouchableOpacity style={styles.settingsMenuButton} onPress={() => (navigation as any).navigate('Settings', { fromMore: true })}>
                  <Ionicons name="settings-outline" size={28} color={theme.primary} style={{ marginBottom: 6 }} />
                  <Text style={styles.moreMenuText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </LinearGradient>
        </View>
      </LinearGradient>
    );
  }

  // --- Scroll Tasbih Screen ---
  if (activeScreen === 'tasbih') {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('more')}>
          <Ionicons name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <ScrollTasbih />
      </View>
    );
  }

  // --- Zabiha Halal Restaurants Screen ---
  if (activeScreen === 'zabiha') {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('more')}>
          <Ionicons name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <ZabihaHalalRestaurants />
      </View>
    );
  }

  // --- Zakat Calculator Screen ---
  if (activeScreen === 'zakat') {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('more')}>
          <Ionicons name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <ZakatCalculator />
      </View>
    );
  }

  // --- Donate Us Screen ---
  if (activeScreen === 'donate') {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveScreen('more')}>
          <Ionicons name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <DonateUs navigation={{ goBack: () => setActiveScreen('more') }} />
      </View>
    );
  }

  // --- Calendar Screen ---
  // calendar removed for v1; coming in v2

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: theme.textLight,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  calculateButton: {
    backgroundColor: theme.primary,
  },
  resetButton: {
    backgroundColor: theme.accent,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: theme.white,
    borderRadius: 8,
    padding: 20,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 18,
    color: theme.primary,
    fontWeight: 'bold',
  },
  zakatAmount: {
    color: theme.secondary,
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 10,
  },
  moreTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 24,
    letterSpacing: 1,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  centeredMenuList: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 0,
  },
  moreMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,152,219,0.08)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 18,
    width: 280,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  moreMenuText: {
    color: theme.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  settingsMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,152,219,0.08)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 18,
    width: 280,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#f7e8a4',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
});

export default MoreScreen;
