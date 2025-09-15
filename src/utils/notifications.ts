// Utility functions for notifications. Do NOT use React hooks here.
// Only call these functions from event handlers or useEffect in React components.
import * as Notifications from 'expo-notifications';

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedulePrayerNotification(
  prayer: string,
  time: string, // 'HH:mm' format
  body?: string
): Promise<string> {
  const [hour, minute] = time.split(':').map(Number);
  const now = new Date();
  const notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
  // If prayer time matches current time (within 1 minute), show immediately
  if (
    now.getHours() === hour &&
    Math.abs(now.getMinutes() - minute) <= 1
  ) {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayer} Prayer Time`,
        body: body || `It's time for ${prayer} prayer.`,
        sound: true,
      },
      trigger: null, // null triggers immediately
    });
  } else {
    // Otherwise, schedule for the next prayer time
    if (notificationTime < now) {
      notificationTime.setDate(notificationTime.getDate() + 1); // schedule for next day if time has passed
    }
    return Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayer} Prayer Time`,
        body: body || `It's time for ${prayer} prayer.`,
        sound: true,
      },
      trigger: {
        type: 'calendar',
        repeats: false,
        dateComponents: {
          hour,
          minute,
        },
      } as any,
    });
  }
}

export async function cancelPrayerNotification(identifier: string): Promise<void> {
  return Notifications.cancelScheduledNotificationAsync(identifier);
}
