// Utility functions for notifications. Do NOT use React hooks here.
// Only call these functions from event handlers or useEffect in React components.
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

// Ensure notifications are displayed when the app is in the foreground.
// Call this once (module initializer is fine) so scheduled/local notifications
// will show an alert/sound while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedulePrayerNotification(
  prayer: string,
  time: string, // 'HH:mm' format
  body?: string,
  repeats = true
): Promise<string> {
  const [hour, minute] = time.split(':').map(Number);
  const now = new Date();
  const notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

  const content = {
    title: prayer === 'Sunrise' ? `Sunrise` : `${prayer} Prayer Time`,
    body: body || `It's time for ${prayer} at ${time}.`,
    sound: true,
    // iOS 15+ interruption level: avoid marking these as "time-sensitive"
    interruptionLevel: 'active',
  } as any;

  // If prayer time matches current time (within 1 minute), show immediately
  if (now.getHours() === hour && Math.abs(now.getMinutes() - minute) <= 1) {
    // Show immediate notification
    await Notifications.scheduleNotificationAsync({ content, trigger: null });
    // Also schedule repeating/calendar notification if requested
    if (repeats) {
      return Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: 'calendar', repeats: true, dateComponents: { hour, minute } } as any,
      });
    }
    return 'immediate';
  }

  // Otherwise schedule for next occurrence using calendar trigger (repeats daily if repeats=true)
  if (notificationTime < now) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }

  return Notifications.scheduleNotificationAsync({
    content,
    trigger: { type: 'calendar', repeats, dateComponents: { hour, minute } } as any,
  });
}

export async function cancelPrayerNotification(identifier: string): Promise<void> {
  return Notifications.cancelScheduledNotificationAsync(identifier);
}

// Storage key for scheduled notification ids
const STORAGE_KEY = 'notifications:scheduledIds';

export async function persistScheduledId(prayer: string, id: string, time?: string) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    obj[prayer] = { id, time };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    // non-fatal
    console.warn('Failed to persist scheduled id', e);
  }
}

export async function removePersistedId(prayer: string) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    delete obj[prayer];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('Failed to remove persisted id', e);
  }
}

export async function restoreScheduledIds(): Promise<{ [prayer: string]: { id: string, time?: string } } | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Failed to restore scheduled ids', e);
    return null;
  }
}
export function openAppSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

// Dev/test helpers removed — use `schedulePrayerNotification` for production scheduling.

/**
 * Schedule a daily Surah Mulk notification at a specified time (HH:mm).
 * If `time` is omitted, caller should compute Isha+1hr and pass it.
 */
export async function scheduleMulkNotification(time?: string, body?: string): Promise<string> {
  const t = time || '00:00';
  const id = await schedulePrayerNotification('Mulk', t, body || 'Time for Surah Al-Mulk — recite before sleep.', true);
  return id;
}
