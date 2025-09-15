import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Switch, Alert } from 'react-native';
import { schedulePrayerNotification, cancelPrayerNotification } from '../utils/notifications';
import { requestNotificationPermission } from '../utils/notifications';

const NotificationsScreen = ({ navigation }) => {
  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const [prayerNotifications, setPrayerNotifications] = useState({
    Fajr: false,
    Sunrise: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
  });
  const [notificationIds, setNotificationIds] = useState({
    Fajr: null,
    Sunrise: null,
    Dhuhr: null,
    Asr: null,
    Maghrib: null,
    Isha: null,
  });
  return (
    <LinearGradient colors={["#00515f", "#368a95"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Notifications Settings</Text>
        <Text style={styles.text}>Toggle prayer notifications below:</Text>
        {prayers.map(prayer => (
          <View key={prayer} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{prayer}</Text>
            <Switch
              value={prayerNotifications[prayer]}
              onValueChange={async (isOn) => {
                setPrayerNotifications(prev => ({ ...prev, [prayer]: isOn }));
                if (isOn) {
                  const granted = await requestNotificationPermission();
                  if (!granted) {
                    Alert.alert('Permission Denied', 'Notification permission is required to enable prayer notifications.');
                    setPrayerNotifications(prev => ({ ...prev, [prayer]: false }));
                    return;
                  }
                  // Schedule notification (default time: 06:00 for demo)
                  const id = await schedulePrayerNotification(prayer, '06:00', `It's time for ${prayer} prayer.`);
                  setNotificationIds(prev => ({ ...prev, [prayer]: id }));
                } else {
                  if (notificationIds[prayer]) {
                    await cancelPrayerNotification(notificationIds[prayer]);
                    setNotificationIds(prev => ({ ...prev, [prayer]: null }));
                  }
                }
                Alert.alert(
                  `${prayer} Notification`,
                  `Notifications for ${prayer} are now ${isOn ? 'ON' : 'OFF'}.`,
                  [{ text: 'OK' }]
                );
              }}
              trackColor={{ false: '#eaf6fb', true: '#2ecc71' }}
              thumbColor={prayerNotifications[prayer] ? '#f7e8a4' : '#fff'}
            />
          </View>
        ))}
        <TouchableWithoutFeedback onPress={() => navigation.navigate('Settings')}>
          <View style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Settings</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 10,
  },
  toggleLabel: {
    fontSize: 17,
    color: '#fff',
    fontWeight: 'bold',
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

export default NotificationsScreen;
