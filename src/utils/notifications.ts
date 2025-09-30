// Utility functions for notifications. Do NOT use React hooks here.
// Only call these functions from event handlers or useEffect in React components.
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

// Set up notification categories for iOS
Notifications.setNotificationCategoryAsync('prayer-reminder', [
  {
    identifier: 'open',
    buttonTitle: 'Open App',
    options: {
      opensAppToForeground: true,
    },
  },
]);

// Ensure notifications are displayed when the app is in the foreground.
// Call this once (module initializer is fine) so scheduled/local notifications
// will show an alert/sound while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    
    if (existing.status === 'granted') return true;
    
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowDisplayInCarPlay: false,
        allowCriticalAlerts: false,
        provideAppNotificationSettings: false,
        allowProvisional: false,
      },
    });
    
    return status === 'granted';
  } catch (e) {
    console.warn('Failed to request notification permission', e);
    return false;
  }
}

export async function schedulePrayerNotification(
  prayer: string,
  time: string, // 'HH:mm' format
  body?: string,
  repeats = true
): Promise<string> {
  if (!time || typeof time !== 'string' || !/^[0-9]{1,2}:[0-9]{2}$/.test(time)) {
    throw new Error('Invalid time format. Expected HH:mm');
  }
  const [hour, minute] = time.split(':').map(Number);
  const now = new Date();
  const notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

  const content = {
    title: prayer === 'Sunrise' ? `Sunrise` : `${prayer} Prayer Time`,
    body: body || `It's time for ${prayer} prayer at ${time}. 🕌`,
    sound: 'default',
    categoryIdentifier: 'prayer-reminder',
    data: { 
      prayer: prayer,
      time: time,
      type: 'prayer-notification'
    },
  } as any;

  // Schedule for next occurrence using calendar trigger (repeats daily if repeats=true)
  if (notificationTime < now) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content,
      trigger: { type: 'calendar', repeats, dateComponents: { hour, minute } } as any,
    });
    return id;
  } catch (e) {
    console.warn('Failed to schedule notification', e);
    return '';
  }
}

export async function cancelPrayerNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (e) {
    console.warn('Failed to cancel scheduled notification', e);
  }
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
  const url = Platform.OS === 'ios' ? 'app-settings:' : undefined;
  if (Platform.OS === 'ios') {
    Linking.canOpenURL(url as string).then(can => {
      if (can) Linking.openURL(url as string);
      else console.warn('Cannot open app-settings URL');
    }).catch(e => console.warn('Failed to open app settings', e));
  } else {
    Linking.openSettings().catch(e => console.warn('Failed to open app settings', e));
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
