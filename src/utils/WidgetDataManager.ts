import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class WidgetDataManager {
  private static groupIdentifier = 'group.com.qalbymuslim.app';

  // Share current ayah data with widget
  static async updateWidgetAyah(ayah: {
    arabic: string;
    translation: string;
    surah: string;
    ayah: string;
  }) {
    try {
      // Store in shared UserDefaults (iOS)
      if (Platform.OS === 'ios') {
        const { NativeModules } = require('react-native');
        const { WidgetData } = NativeModules;
        
        if (WidgetData) {
          await WidgetData.setString('currentAyah_arabic', ayah.arabic);
          await WidgetData.setString('currentAyah_translation', ayah.translation);
          await WidgetData.setString('currentAyah_surah', ayah.surah);
          await WidgetData.setString('currentAyah_number', ayah.ayah);
        }
      }
      
      // Also store locally for backup
      await AsyncStorage.setItem('widget_ayah', JSON.stringify(ayah));
    } catch (error) {
      console.warn('Failed to update widget ayah data:', error);
    }
  }

  // Share prayer times data with widget
  static async updateWidgetPrayerTimes(prayerTimes: any, currentPrayer: string, nextPrayer: string, timeToNext: string) {
    try {
      if (Platform.OS === 'ios') {
        const { NativeModules } = require('react-native');
        const { WidgetData } = NativeModules;
        
        if (WidgetData) {
          await WidgetData.setString('prayer_fajr', this.formatTo12Hour(prayerTimes.Fajr || ''));
          await WidgetData.setString('prayer_sunrise', this.formatTo12Hour(prayerTimes.Sunrise || ''));
          await WidgetData.setString('prayer_dhuhr', this.formatTo12Hour(prayerTimes.Dhuhr || ''));
          await WidgetData.setString('prayer_asr', this.formatTo12Hour(prayerTimes.Asr || ''));
          await WidgetData.setString('prayer_maghrib', this.formatTo12Hour(prayerTimes.Maghrib || ''));
          await WidgetData.setString('prayer_isha', this.formatTo12Hour(prayerTimes.Isha || ''));
          await WidgetData.setString('currentPrayer', currentPrayer || '');
          await WidgetData.setString('nextPrayer', nextPrayer || '');
          await WidgetData.setString('timeToNext', timeToNext || '');
        }
      }
      
      // Store locally for backup
      await AsyncStorage.setItem('widget_prayers', JSON.stringify({
        prayerTimes,
        currentPrayer,
        nextPrayer,
        timeToNext
      }));
    } catch (error) {
      console.warn('Failed to update widget prayer data:', error);
    }
  }

  // Share location data with widget
  static async updateWidgetLocation(locationName: string) {
    try {
      if (Platform.OS === 'ios') {
        const { NativeModules } = require('react-native');
        const { WidgetData } = NativeModules;
        
        if (WidgetData) {
          await WidgetData.setString('location', locationName || 'Your Location');
        }
      }
      
      await AsyncStorage.setItem('widget_location', locationName);
    } catch (error) {
      console.warn('Failed to update widget location:', error);
    }
  }

  // Request widget timeline reload
  static async reloadWidgetTimeline() {
    try {
      if (Platform.OS === 'ios') {
        const { NativeModules } = require('react-native');
        const { WidgetData } = NativeModules;
        
        if (WidgetData && WidgetData.reloadTimelines) {
          await WidgetData.reloadTimelines();
        }
      }
    } catch (error) {
      console.warn('Failed to reload widget timeline:', error);
    }
  }

  private static formatTo12Hour(time: string): string {
    if (!time) return '--:--';
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }
}

export default WidgetDataManager;