import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const ThemeScreen = ({ navigation }) => {
  const { mode, setMode, theme } = useTheme();
  const previewTheme = mode === 'night'
    ? {
        background: '#18181c',
        card: '#222f3e',
        accent: '#ee5253',
        text: '#f5f6fa',
        border: '#576574',
        shadow: '#000',
      }
    : mode === 'day'
    ? {
        background: '#eaf6fb',
        card: '#fff',
        accent: '#e74c3c',
        text: '#2c3e50',
        border: '#e0e0e0',
        shadow: '#000',
      }
    : {
        background: theme.background,
        card: theme.primary,
        accent: theme.accent,
        text: theme.text,
        border: theme.border,
        shadow: theme.shadow,
      };

  return (
    <LinearGradient colors={mode === 'night' ? ["#18181c", "#222f3e"] : ["#00515f", "#368a95"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Theme Settings</Text>
        <Text style={styles.text}>Current mode: <Text style={{ fontWeight: 'bold', color: '#f7e8a4' }}>{mode.toUpperCase()}</Text></Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.modeButton, mode === 'auto' && styles.selectedButton]} onPress={() => setMode('auto')}>
            <Text style={[styles.buttonText, mode === 'auto' && { color: '#00515f' }]}>Auto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, mode === 'day' && styles.selectedButton]} onPress={() => setMode('day')}>
            <Text style={[styles.buttonText, mode === 'day' && { color: '#00515f' }]}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, mode === 'night' && styles.selectedButton]} onPress={() => setMode('night')}>
            <Text style={[styles.buttonText, mode === 'night' && { color: '#18181c' }]}>Night</Text>
          </TouchableOpacity>
        </View>
        {/* Preview Card for Night Mode */}
        <View style={[styles.previewCard, { backgroundColor: previewTheme.card, borderColor: previewTheme.border, shadowColor: previewTheme.shadow }]}>
          <Text style={[styles.previewTitle, { color: previewTheme.text }]}>Preview</Text>
          <Text style={[styles.previewText, { color: previewTheme.text }]}>This is how your app will look in {mode} mode.</Text>
          <View style={[styles.previewAccent, { backgroundColor: previewTheme.accent }]} />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Settings</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  previewCard: {
    width: '80%',
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    borderWidth: 2,
    backgroundColor: '#222f3e',
    borderColor: '#576574',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  previewText: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  previewAccent: {
    width: 48,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7e8a4',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  modeButton: {
    backgroundColor: '#368a95',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  selectedButton: {
    backgroundColor: '#f7e8a4',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 32,
    backgroundColor: '#368a95',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ThemeScreen;
