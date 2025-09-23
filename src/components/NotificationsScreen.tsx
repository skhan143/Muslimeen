import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Switch, Alert } from 'react-native';
import { schedulePrayerNotification, scheduleMulkNotification, cancelPrayerNotification, requestNotificationPermission, persistScheduledId, removePersistedId, restoreScheduledIds, openAppSettings } from '../utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = ({ navigation }) => {
  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  // Include Surah Mulk as a special nightly reminder
  const extendedPrayers = [...prayers, 'Surah Mulk'];
  const [prayerNotifications, setPrayerNotifications] = useState({
    Fajr: false,
    Sunrise: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
  });
  const [notificationIds, setNotificationIds] = useState<any>({
    Fajr: null,
    Sunrise: null,
    Dhuhr: null,
    Asr: null,
    Maghrib: null,
    Isha: null,
  });

  // Restore persisted scheduled ids when the screen mounts
  React.useEffect(() => {
    (async () => {
      const restored = await restoreScheduledIds();
      if (restored) {
        setNotificationIds(prev => ({ ...prev, ...restored }));
        // Also mark toggles as on for entries we have ids for
        setPrayerNotifications(prev => {
          const copy = { ...prev };
          Object.keys(restored).forEach(k => { if (restored[k]) copy[k] = true; });
          return copy;
        });
      }
      // Load latest persisted prayer times (stored by HomeScreen)
      try {
        const raw = await AsyncStorage.getItem('prayerTimes:latest');
        if (raw) {
          const pts = JSON.parse(raw);
          setPrayerTimesPersisted(pts);
        }
      } catch (e) {
        console.warn('Failed to load persisted prayer times', e);
      }
    })();
  }, []);

  const [prayerTimesPersisted, setPrayerTimesPersisted] = React.useState<any>(null);
  return (
    <LinearGradient colors={["#00515f", "#368a95"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Notifications Settings</Text>
        {/* Production: no dev test buttons shown */}
        <Text style={styles.text}>Toggle prayer notifications below:</Text>
        {extendedPrayers.map(prayer => (
          <View key={prayer} style={[styles.toggleRow, { alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={styles.toggleLabel}>{prayer}</Text>
                {prayer === 'Surah Mulk' && (
                  <Text style={styles.subtext}>Recommended/Sunnah: recite before sleep — schedules 1 hour after Isha.</Text>
                )}
              </View>
              {notificationIds[prayer] && notificationIds[prayer].time && (
                <Text style={{ color: '#fff', marginLeft: 8, fontSize: 13 }}>({notificationIds[prayer].time})</Text>
              )}
            </View>
            <Switch
              value={prayerNotifications[prayer]}
              onValueChange={async (isOn) => {
                setPrayerNotifications(prev => ({ ...prev, [prayer]: isOn }));
                if (isOn) {
                  const granted = await requestNotificationPermission();
                  if (!granted) {
                    Alert.alert(
                      'Permission Denied',
                      'Notification permission is required to enable prayer notifications.\nYou can enable it in Settings.',
                      [
                        { text: 'Open Settings', onPress: () => openAppSettings() },
                        { text: 'Cancel' }
                      ]
                    );
                    setPrayerNotifications(prev => ({ ...prev, [prayer]: false }));
                    return;
                  }
                  // Determine default time: prefer persisted prayerTimes from HomeScreen, then persisted notification time
                  const defaultFromPrayerTimes = prayerTimesPersisted && prayerTimesPersisted[prayer];
                  const defaultFromPersisted = notificationIds[prayer] && notificationIds[prayer].time;
                  if (prayer === 'Surah Mulk') {
                    // Schedule at Isha + 1 hour if possible
                    let mulkTime = '23:00';
                    try {
                      const isha = prayerTimesPersisted && prayerTimesPersisted['Isha'];
                      if (isha) {
                        const [h, m] = isha.split(':').map(Number);
                        const dt = new Date();
                        dt.setHours(h + 1, m, 0, 0);
                        const hh = dt.getHours().toString().padStart(2, '0');
                        const mm = dt.getMinutes().toString().padStart(2, '0');
                        mulkTime = `${hh}:${mm}`;
                      } else if (defaultFromPersisted) {
                        mulkTime = defaultFromPersisted;
                      }
                    } catch (e) {
                      console.warn('Failed to compute Mulk time', e);
                    }
                    const id = await scheduleMulkNotification(mulkTime, `Time to recite Surah Al-Mulk.`);
                    setNotificationIds(prev => ({ ...prev, [prayer]: { id, time: mulkTime } }));
                    await persistScheduledId(prayer, id, mulkTime);
                  } else {
                    const time = defaultFromPrayerTimes || defaultFromPersisted || '06:00';
                    const id = await schedulePrayerNotification(prayer, time, `It's time for ${prayer} prayer.`);
                    setNotificationIds(prev => ({ ...prev, [prayer]: { id, time } }));
                    await persistScheduledId(prayer, id, time);
                  }
                  } else {
                  if (notificationIds[prayer] && notificationIds[prayer].id) {
                    await cancelPrayerNotification(notificationIds[prayer].id);
                    await removePersistedId(prayer);
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
            {/* Production: remove per-prayer test button */}
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
  subtext: {
    color: '#dfeef0',
    fontSize: 11,
    marginTop: 1,
    maxWidth: 180,
  },
});

export default NotificationsScreen;
