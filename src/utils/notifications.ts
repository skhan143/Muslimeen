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
  try {
    const existing = await Notifications.getPermissionsAsync();
    const existingStatus = (existing as any)?.status;
    if (existingStatus === 'granted' || existingStatus === 'provisional') return true;
    const { status, ios } = await Notifications.requestPermissionsAsync();
    const finalStatus = status || (ios && (ios as any).status) || '';
    return finalStatus === 'granted' || finalStatus === 'provisional';
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
    body: body || `It's time for ${prayer} at ${time}.`,
    sound: true,
    // iOS 15+ interruption level: avoid marking these as "time-sensitive"
    interruptionLevel: 'active',
  } as any;

  // If prayer time matches current time (within 1 minute), show immediately
  if (now.getHours() === hour && Math.abs(now.getMinutes() - minute) <= 1) {
    let immediateId: string | null = null;
    try {
      immediateId = await Notifications.scheduleNotificationAsync({ content, trigger: null });
    } catch (e) {
      console.warn('Failed to show immediate notification', e);
    }
    // Also schedule repeating/calendar notification if requested
    if (repeats) {
      try {
        const repeatingId = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: 'calendar', repeats: true, dateComponents: { hour, minute } } as any,
        });
        return repeatingId;
      } catch (e) {
        console.warn('Failed to schedule repeating notification after immediate', e);
        return immediateId || '';
      }
    }
    return immediateId || '';
  }

  // Otherwise schedule for next occurrence using calendar trigger (repeats daily if repeats=true)
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
