import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Share, Alert, Linking, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const theme = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  background: '#eaf6fb',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  white: '#ffffff',
  border: '#e0e0e0',
  shadow: '#000000',
};

// Settings options with navigation and feedback
const APP_VERSION = '1.0.0'; // Update this if you want to fetch dynamically from package.json
const APP_LINK = 'https://play.google.com/store/apps/details?id=com.yourapp.package'; // Replace with your real app link


const THEME_OPTIONS = [
  { key: 'light', label: 'Light', preview: { backgroundColor: '#fff', textColor: '#222' } },
  { key: 'dark', label: 'Dark', preview: { backgroundColor: '#222', textColor: '#fff' } },
  { key: 'system', label: 'System Default', preview: { backgroundColor: '#eaf6fb', textColor: '#2c3e50' } },
];

// SettingsScreen component

const SettingsScreen = ({ navigation }) => {
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('system');

  // Professional settings options array
  const settingsOptions = [
    {
      icon: 'information-circle-outline' as const,
      label: 'About App',
      onPress: () => Alert.alert(
        'About QalbyMuslim!',
        `Version: ${APP_VERSION}\n\nQalbyMuslim! helps you manage your daily Islamic routines, prayer times, and more.\n\nDeveloped with care for the Ummah.`
      ),
    },
    {
      icon: 'star-outline' as const,
      label: 'Rate Us',
      onPress: () => {
        Linking.openURL(APP_LINK).catch(() => Alert.alert('Error', 'Unable to open the app store link.'));
      },
    },
    {
      icon: 'share-social-outline' as const,
      label: 'Share App',
      onPress: async () => {
        try {
          await Share.share({
            message: `Check out QalbyMuslim! Your daily Islamic companion. Download now: ${APP_LINK}`,
          });
        } catch (error) {
          Alert.alert('Error', 'Unable to share the app link.');
        }
      },
    },
    {
      icon: 'document-text-outline' as const,
      label: 'Terms of Service',
      onPress: () => Alert.alert(
        'Terms of Service',
        'By using QalbyMuslim!, you agree to use the app respectfully and lawfully. No personal data is collected. For questions, contact qalbymuslim1@gmail.com.'
      ),
    },
    {
      icon: 'moon-outline' as const,
      label: 'Theme',
      onPress: () => setThemeModalVisible(true),
    },
    {
      icon: 'notifications-outline' as const,
      label: 'Notifications',
      onPress: () => navigation && navigation.navigate('Notifications'),
    },
    {
      icon: 'lock-closed-outline' as const,
      label: 'Privacy',
      onPress: () => Alert.alert(
        'Privacy Policy',
        'We do not collect, store, or share any personal information. All data stays on your device.\n\nWe do not use cookies or tracking technologies.\n\nIf you contact us for support, your email will only be used to respond to your inquiry.\n\nBy using this app, you agree to this policy. For questions, contact qalbymuslim1@gmail.com.'
      ),
    },
    {
      icon: 'help-circle-outline' as const,
      label: 'Help & Support',
      onPress: () => Alert.alert(
        'Help & Support',
        'QalbyMuslim! v1.0.0\n\nThis app is free and developed with dedication for the Ummah. We are working hard to improve and add more features—please be patient and support us!\n\nIf you find value in this app, consider donating to help us continue.\n\nFor support, feedback, or suggestions, email:\nqalbymuslim1@gmail.com\n\n---\n\nEmail Format:\nSubject: QalbyMuslim! Support\nMessage: [Describe your issue, feedback, or suggestion here]\n\nJazakAllah Khair for your patience and support!'
      ),
    },
  ];

  return (
    <LinearGradient
      colors={["#00515f", "#368a95"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <Ionicons name="settings-outline" size={32} color="#f7e8a4" style={{ marginBottom: 8 }} />
          <Text style={styles.headerText}>Settings</Text>
        </View>
        <View style={styles.optionsWrap}>
          {settingsOptions.map((opt, idx) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.optionCard}
              onPress={opt.onPress}
            >
              <Ionicons name={opt.icon} size={24} color="#f7e8a4" style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('More')}>
          <Text style={styles.backButtonText}>Back to More</Text>
        </TouchableOpacity>
        <Text style={styles.creditText}>
          Privacy Policy: We do not collect, store, or share any personal information. All data stays on your device. For questions, contact qalbymuslim1@gmail.com.
        </Text>
      </ScrollView>

      {/* Theme Modal */}
      <Modal
        visible={themeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.themeModal}>
            <Text style={styles.themeModalTitle}>Choose Theme</Text>
            {THEME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.themeOption,
                  selectedTheme === option.key && styles.themeOptionSelected,
                ]}
                onPress={() => {
                  setSelectedTheme(option.key);
                  setThemeModalVisible(false);
                  // Here you would save the theme to AsyncStorage and apply it globally
                }}
              >
                <View style={[styles.themePreview, { backgroundColor: option.preview.backgroundColor }]}> 
                  <Text style={{ color: option.preview.textColor, fontWeight: 'bold' }}>{option.label}</Text>
                </View>
                {selectedTheme === option.key && (
                  <Ionicons name="checkmark-circle" size={22} color="#368a95" style={{ marginLeft: 10 }} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.themeModalClose} onPress={() => setThemeModalVisible(false)}>
              <Text style={{ color: '#368a95', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeModal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  themeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#368a95',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: 220,
    backgroundColor: '#f2f6fa',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionSelected: {
    borderColor: '#368a95',
    backgroundColor: '#eaf6fb',
  },
  themePreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  themeModalClose: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eaf6fb',
  },
  backButton: {
    marginTop: 32,
    backgroundColor: '#368a95',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 12,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f7e8a4',
    textShadowColor: '#00515f',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  optionsWrap: {
    width: '100%',
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 16,
    padding: 18,
    marginVertical: 4,
    borderWidth: 1.5,
    borderColor: '#f7e8a4',
    shadowColor: '#00515f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  optionText: {
    color: theme.white,
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  creditText: {
    fontSize: 12,
    color: 'rgba(44,62,80,0.55)',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'center',
  },
});

export default SettingsScreen;
