import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  Animated
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { requestNotificationPermission, schedulePrayerNotification, cancelPrayerNotification, persistScheduledId, removePersistedId, restoreScheduledIds } from '../utils/notifications';
import { LinearGradient } from 'expo-linear-gradient';
import WidgetDataManager from '../utils/WidgetDataManager';

// Theme colors (matching App.tsx)
const theme = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  background: '#eaf6fb', // soft light blue
  text: '#2c3e50',
  textLight: '#7f8c8d',
  white: '#ffffff',
  border: '#e0e0e0',
  shadow: '#000000',
};

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Store notification IDs for each prayer
  const [notificationIds, setNotificationIds] = useState({
    Fajr: null,
    Sunrise: null,
    Dhuhr: null,
    Asr: null,
    Maghrib: null,
    Isha: null,
  });
  // Track notification status for each prayer
  const [prayerNotifications, setPrayerNotifications] = useState({
    Fajr: false,
    Sunrise: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
  });
  const [numProductsToShow, setNumProductsToShow] = useState(4);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>({});
  const [locationName, setLocationName] = useState('');
  const [dateInfo, setDateInfo] = useState<any>(null);
  const [arabicDateInfo, setArabicDateInfo] = useState<any>(null);
  const [formattedDate, setFormattedDate] = useState('');
  const [ramadanFastingTimes, setRamadanFastingTimes] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
  const [ayah, setAyah] = useState<any>(null);
  const [ayahLoading, setAyahLoading] = useState<boolean>(true);
  const [selectedMadhab, setSelectedMadhab] = useState(0); // 0: Shafi’i/Maliki/Hanbali, 1: Hanafi
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const ayahList = [
    {
      arabic: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
      translation: "O my Lord, surely I have need of whatever good You send me.",
      surah: "Al-Qasas",
      ayah: "24"
    },
    {
      arabic: "وَقُلْ رَبِّ زِدْنِي عِلْمًا",
      translation: "And say: My Lord, increase me in knowledge.",
      surah: "Ta-Ha",
      ayah: "114"
    },
    {
      arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "Indeed, with hardship [will be] ease.",
      surah: "Ash-Sharh",
      ayah: "6"
    },
    {
      arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of [all] existence.",
      surah: "Al-Baqarah",
      ayah: "255"
    },
    {
      arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
      translation: "Indeed, Allah is with the patient.",
      surah: "Al-Baqarah",
      ayah: "153"
    },
    {
      arabic: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
      translation: "And my success is not but through Allah.",
      surah: "Hud",
      ayah: "88"
    },
    {
      arabic: "إِنَّ رَبِّي لَسَمِيعُ الدُّعَاءِ",
      translation: "Indeed, my Lord is the Hearer of supplication.",
      surah: "Ibrahim",
      ayah: "39"
    },
    {
      arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "For indeed, with hardship [will be] ease.",
      surah: "Ash-Sharh",
      ayah: "5"
    },
    {
      arabic: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
      translation: "Indeed, Allah loves the doers of good.",
      surah: "Al-Baqarah",
      ayah: "195"
    },
    {
      arabic: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا",
      translation: "And the servants of the Most Merciful are those who walk upon the earth easily.",
      surah: "Al-Furqan",
      ayah: "63"
    },
    {
      arabic: "رَبِّ اشْرَحْ لِي صَدْرِي",
      translation: "My Lord, expand for me my breast [with assurance].",
      surah: "Ta-Ha",
      ayah: "25"
    },
    {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
      translation: "O Allah, I ask You for guidance, piety, chastity and self-sufficiency.",
      surah: "Hadith (Prophetic)",
      ayah: "N/A"
    },
    {
      arabic: "رَبِّ يَسِّرْ وَلَا تُعَسِّرْ",
      translation: "My Lord, make it easy and do not make it difficult.",
      surah: "Hadith (Prophetic)",
      ayah: "N/A"
    }
  ];

  const [ayahIndex, setAyahIndex] = useState(Math.floor(Math.random() * ayahList.length));

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        getLocation(),
        fetchDateInfo(),
        fetchArabicDateInfo()
      ]);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
  };

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Restore persisted scheduled ids when HomeScreen mounts so toggles reflect actual scheduled state
  useEffect(() => {
    (async () => {
      const restored = await restoreScheduledIds();
      if (restored) {
        // restored entries are { prayer: { id, time } }
        const ids: any = {};
        const toggles: any = {};
        Object.keys(restored).forEach(k => {
          ids[k] = restored[k];
          toggles[k] = true;
        });
        setNotificationIds(prev => ({ ...prev, ...ids }));
        setPrayerNotifications(prev => ({ ...prev, ...toggles }));
      }
      
      // Load saved Madhab selection
      try {
        const savedMadhab = await AsyncStorage.getItem('selectedMadhab');
        if (savedMadhab !== null) {
          setSelectedMadhab(parseInt(savedMadhab, 10));
        }
      } catch (e) {
        console.warn('Failed to load saved Madhab selection', e);
      }
    })();
  }, []);

  useEffect(() => {
    fetchAllData();

    // Update current time every second for UI clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Update the formatted date/time every minute so the UI stays accurate
    const minuteTimer = setInterval(() => {
      if (prayerTimes && Object.keys(prayerTimes).length > 0) {
        const now = new Date();
        const formattedDateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear().toString().slice(-2)}`;
        const formattedTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeToNextPrayer = getTimeToNextPrayer();
        setFormattedDate(`${formattedDateStr} | ${formattedTimeStr}${timeToNextPrayer}`);
      }
    }, 60000);

    // Run wave animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Initialize formatted date immediately so UI doesn't wait for minute tick
    const now = new Date();
    const initialFormattedDateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear().toString().slice(-2)}`;
    const initialFormattedTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Don't add prayer time initially since prayer times aren't loaded yet
    setFormattedDate(`${initialFormattedDateStr} | ${initialFormattedTimeStr}`);

    return () => {
      clearInterval(timer);
      clearInterval(minuteTimer);
    };
  }, []);

  useEffect(() => {
    if (currentLocation) {
      getPrayerTimes();
      reverseGeocode();
    }
  }, [currentLocation, selectedMadhab]);

  useEffect(() => {
    if (prayerTimes) {
      determineCurrentPrayer();
    }
  }, [currentTime, prayerTimes]);

  // Reschedule Asr notification when prayer times update and notification was enabled
  useEffect(() => {
    const rescheduleAsrNotification = async () => {
      if (prayerTimes.Asr && prayerNotifications.Asr && !notificationIds.Asr) {
        // User had Asr notifications enabled but notification was cancelled due to Madhab change
        // Schedule new notification with updated Asr time
        const id = await schedulePrayerNotification('Asr', prayerTimes.Asr, `It's time for Asr prayer.`);
        setNotificationIds((prev) => ({ ...prev, Asr: { id, time: prayerTimes.Asr } }));
        await persistScheduledId('Asr', id, prayerTimes.Asr);
      }
    };
    
    rescheduleAsrNotification();
  }, [prayerTimes.Asr, prayerNotifications.Asr, notificationIds.Asr]);

  // Update formatted date with time to next prayer when prayer times change
  useEffect(() => {
    if (prayerTimes && Object.keys(prayerTimes).length > 0) {
      const now = new Date();
      const formattedDateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear().toString().slice(-2)}`;
      const formattedTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeToNextPrayer = getTimeToNextPrayer();
      setFormattedDate(`${formattedDateStr} | ${formattedTimeStr}${timeToNextPrayer}`);
    }
  }, [prayerTimes]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } else {
        setError('Location permission denied. Some features may be limited.');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setError('Unable to get your location. Please check your settings.');
    }
  };

  const getTimeToNextPrayer = () => {
    if (!prayerTimes || Object.keys(prayerTimes).length === 0) return '';
    
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    // Convert prayer times to minutes
    const prayerTimesInMinutes = {};
    prayerOrder.forEach(prayer => {
      if (prayerTimes[prayer]) {
        const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
        prayerTimesInMinutes[prayer] = hours * 60 + minutes;
      }
    });
    
    // Find next prayer
    let nextPrayer = null;
    let timeToNext = 0;
    
    for (const prayer of prayerOrder) {
      if (prayerTimesInMinutes[prayer] && prayerTimesInMinutes[prayer] > currentTimeInMinutes) {
        nextPrayer = prayer;
        timeToNext = prayerTimesInMinutes[prayer] - currentTimeInMinutes;
        break;
      }
    }
    
    // If no prayer found today, next prayer is Fajr tomorrow
    if (!nextPrayer && prayerTimesInMinutes['Fajr']) {
      nextPrayer = 'Fajr';
      timeToNext = (24 * 60) - currentTimeInMinutes + prayerTimesInMinutes['Fajr'];
    }
    
    if (nextPrayer && timeToNext > 0) {
      const hours = Math.floor(timeToNext / 60);
      const minutes = timeToNext % 60;
      if (hours > 0) {
        return ` | ${hours}h ${minutes}m to ${nextPrayer}`;
      } else {
        return ` | ${minutes}m to ${nextPrayer}`;
      }
    }
    
    return '';
  };

  const fetchDateInfo = async () => {
    try {
      const response = await axios.get('https://worldtimeapi.org/api/ip', { timeout: 10000 });
      const { datetime } = response.data;
      const date = new Date(datetime);
      const formattedDateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
      const formattedTimeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeToNextPrayer = getTimeToNextPrayer();
      setFormattedDate(`${formattedDateStr} | ${formattedTimeStr}${timeToNextPrayer}`);
    } catch (error) {
      // Log axios-friendly details when available so we can inspect network errors in Metro
      console.error('Error fetching date info:', error, (error && typeof error === 'object' && (error as any).toJSON) ? (error as any).toJSON() : null);
      // Fallback to local time if API fails
      const now = new Date();
      const formattedDateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear().toString().slice(-2)}`;
      const formattedTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeToNextPrayer = getTimeToNextPrayer();
      setFormattedDate(`${formattedDateStr} | ${formattedTimeStr}${timeToNextPrayer}`);
    }
  };

  const fetchArabicDateInfo = async () => {
    try {
      const response = await axios.get('https://api.aladhan.com/v1/gToH', { timeout: 10000 });
      setArabicDateInfo(response.data);
    } catch (error) {
      console.error('Error fetching Arabic date info:', error, (error && typeof error === 'object' && (error as any).toJSON) ? (error as any).toJSON() : null);
      setError('Unable to fetch Islamic date information.');
    }
  };

  const getPrayerTimes = async () => {
    if (!currentLocation) {
      console.error('Current location is not available.');
      return;
    }

    const { latitude, longitude } = currentLocation;
    const method = 2; // Choose the desired prayer times calculation method
    // Use HTTPS (Android cleartext policies may block http requests)
    const apiUrl = `https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${selectedMadhab}`;

    try {
      const response = await axios.get(apiUrl, { timeout: 10000 });
      if (response.data?.data?.timings) {
        const data = response.data.data.timings;
        setPrayerTimes(data);
        // Persist latest prayer times so other screens can use them (Notifications screen)
        try {
          await AsyncStorage.setItem('prayerTimes:latest', JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to persist prayer times', e);
        }
        const ramadanFastingTimes = {
          Imsak: data.Imsak,
          Maghrib: data.Maghrib,
        };
        setRamadanFastingTimes(ramadanFastingTimes);
      }
    } catch (error) {
      // Log extended axios error info where available to help diagnose 'Network Error'
      console.error('Error fetching prayer times:', error, (error && typeof error === 'object' && (error as any).toJSON) ? (error as any).toJSON() : null);
      // Try to fall back to persisted prayer times so the UI still shows something
      try {
        const raw = await AsyncStorage.getItem('prayerTimes:latest');
        if (raw) {
          const persisted = JSON.parse(raw);
          setPrayerTimes(persisted);
          console.info('Used persisted prayer times as a fallback.');
          return;
        }
      } catch (e) {
        console.warn('Failed to read persisted prayer times', e);
      }

      setError('Unable to fetch prayer times. Please check your internet connection and try again.');
    }
  };

  const reverseGeocode = async () => {
    if (!currentLocation) return;

    const { latitude, longitude } = currentLocation;
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.address) {
        setLocationName(data.address.city || data.address.town || data.address.village || '');
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
  };

  const toggleProducts = () => {
    setNumProductsToShow(prev => prev === 4 ? 8 : 4);
  };

  const determineCurrentPrayer = () => {
    if (!prayerTimes) return;

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const prayerTimesInMinutes: { [key: string]: number } = {};
    
    // Convert prayer times to minutes
    Object.entries(prayerTimes).forEach(([prayer, time]) => {
      if (time && typeof time === 'string') {
        const [hours, minutes] = time.split(':').map(Number);
        prayerTimesInMinutes[prayer] = hours * 60 + minutes;
      }
    });

    // Define prayer order
    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    // Find current prayer
    let currentPrayerName = null;

    // Special case: If current time is before Fajr, show Isha as current
    if (prayerTimesInMinutes['Fajr'] && currentTimeInMinutes < prayerTimesInMinutes['Fajr']) {
      currentPrayerName = 'Isha';
    } else {
      // Check each prayer time interval
      for (let i = 0; i < prayerOrder.length - 1; i++) {
        const currentPrayer = prayerOrder[i];
        const nextPrayer = prayerOrder[i + 1];
        
        if (prayerTimesInMinutes[currentPrayer] && prayerTimesInMinutes[nextPrayer]) {
          if (currentTimeInMinutes >= prayerTimesInMinutes[currentPrayer] && 
              currentTimeInMinutes < prayerTimesInMinutes[nextPrayer]) {
            currentPrayerName = currentPrayer;
            break;
          }
        }
      }

      // If we're after Isha, show Isha as current
      if (!currentPrayerName && prayerTimesInMinutes['Isha'] && 
          currentTimeInMinutes >= prayerTimesInMinutes['Isha']) {
        currentPrayerName = 'Isha';
      }
    }

    setCurrentPrayer(currentPrayerName);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAyahIndex(prev => (prev + 1) % ayahList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update widget when ayah changes
  useEffect(() => {
    const currentAyah = ayahList[ayahIndex];
    WidgetDataManager.updateWidgetAyah(currentAyah);
  }, [ayahIndex]);

  // Update widget when prayer times change
  useEffect(() => {
    if (prayerTimes && Object.keys(prayerTimes).length > 0) {
      const timeToNext = getTimeToNextPrayer();
      let nextPrayer = '';
      if (timeToNext.includes('to ')) {
        nextPrayer = timeToNext.split('to ')[1];
      }
      WidgetDataManager.updateWidgetPrayerTimes(prayerTimes, currentPrayer || '', nextPrayer, timeToNext);
      WidgetDataManager.reloadWidgetTimeline();
    }
  }, [prayerTimes, currentPrayer]);

  // Update widget when location changes
  useEffect(() => {
    if (locationName) {
      WidgetDataManager.updateWidgetLocation(locationName);
    }
  }, [locationName]);

  const formatTo12Hour = (time: string) => {
    if (!time) return '--:--';
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper function for timeline progress
  function getTimelineProgress(prayerTimes, currentTime) {
    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    // Get prayer times in minutes
    const times = prayerOrder.map(p => {
      const t = prayerTimes[p];
      if (!t) return null;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    });
    // Find current interval
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    let startIdx = 0;
    for (let i = 0; i < times.length - 1; i++) {
      if (times[i] !== null && times[i + 1] !== null && now >= times[i] && now < times[i + 1]) {
        startIdx = i;
        break;
      }
      // If before first prayer
      if (now < times[0]) {
        startIdx = 0;
        break;
      }
      // If after last prayer
      if (now >= times[times.length - 1]) {
        startIdx = times.length - 1;
        break;
      }
    }
    // Calculate progress within current interval
    const start = times[startIdx];
    const end = times[startIdx + 1] !== undefined ? times[startIdx + 1] : start;
    if (now <= start) return (startIdx / (times.length - 1)) * 100;
    if (end === start) return 100;
    const intervalProgress = ((now - start) / (end - start));
    const totalProgress = (startIdx + intervalProgress) / (times.length - 1);
    return Math.max(0, Math.min(100, totalProgress * 100));
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#00515f", "#368a95"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={theme.accent} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Top Card: Date, Balance, Actions */}
        <LinearGradient
          colors={["#0f2027", "#00515f", "#368a95"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.topCardWrap, { minHeight: 260, maxHeight: 340, borderWidth: 2, borderColor: '#f7e8a4' }]}
        >
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', minWidth: 120, maxWidth: 340 }}>
            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '#f7e8a4',
              letterSpacing: 0.5,
              textAlign: 'left',
              marginBottom: 4,
              fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif',
            }}>Assalamu Alaikum!</Text>
            <Text style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: theme.white,
              letterSpacing: 0.2,
              textAlign: 'left',
              marginBottom: 8,
              fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'sans-serif',
            }}>{formattedDate}</Text>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
              <Text style={{ fontSize: 28, color: '#f7e8a4', fontWeight: 'bold', textAlign: 'center', marginBottom: 10, fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'sans-serif', textShadowColor: '#00515f', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, lineHeight: 28 * 1.8 }}>
                {ayahList[ayahIndex].arabic}
              </Text>
              <Text style={{ fontSize: 17, color: theme.white, textAlign: 'center', marginBottom: 6, fontWeight: '600', textShadowColor: '#00515f', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                {ayahList[ayahIndex].translation}
              </Text>
              <Text style={{ fontSize: 13, color: theme.textLight, textAlign: 'center', fontWeight: '500' }}>
                {ayahList[ayahIndex].surah} • Ayah {ayahList[ayahIndex].ayah}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Location */}
        {currentLocation && (
          <LinearGradient
            colors={["#0f2027", "#00515f", "#368a95"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.glassyPrayerCard, { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, marginBottom: 0 }]}
          >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={22} color="#f7e8a4" style={{ marginRight: 8 }} />
              <Text style={{ color: '#f7e8a4', fontSize: 17, fontWeight: 'bold', textShadowColor: '#00515f', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
                {locationName || 'Your Location'}
              </Text>
            </View>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}
              onPress={() => navigation.navigate('DonateUs')}
            >
              <Ionicons name="heart-outline" size={18} color="#ffd700" style={{ marginRight: 4 }} />
              <Text style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 14 }}>Donate Us</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Prayer Times Card */}
        <LinearGradient
          colors={["#0f2027", "#00515f", "#368a95"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassyPrayerCard}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color="#f7e8a4" />
            <Text style={[styles.sectionTitle, { color: '#f7e8a4', textShadowColor: '#00515f', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>Prayer Times</Text>
          </View>
          {/* Madhab Selection Card (Simplified) */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: 10, marginHorizontal: 2, marginBottom: 4, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#f7e8a4', shadowColor: '#00515f', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: selectedMadhab === 0 ? 'rgba(255,255,255,0.22)' : 'transparent', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: selectedMadhab === 0 ? 2 : 0, borderColor: selectedMadhab === 0 ? '#f7e8a4' : 'transparent' }}
                onPress={async () => {
                  const oldMadhab = selectedMadhab;
                  setSelectedMadhab(0);
                  try {
                    await AsyncStorage.setItem('selectedMadhab', '0');
                    // If Madhab changed and user had Asr notifications enabled, cancel old notification
                    if (oldMadhab !== 0 && prayerNotifications.Asr && notificationIds.Asr && notificationIds.Asr.id) {
                      await cancelPrayerNotification(notificationIds.Asr.id);
                      await removePersistedId('Asr');
                      setNotificationIds((prev) => ({ ...prev, Asr: null }));
                    }
                  } catch (e) {
                    console.warn('Failed to save Madhab selection', e);
                  }
                }}
              >
                <Text style={{ color: '#f7e8a4', fontWeight: 'bold', fontSize: 15 }}>Shafi’i/Maliki/Hanbali</Text>
                <Text style={{ color: theme.white, fontSize: 12 }}>Earlier Asr</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: selectedMadhab === 1 ? 'rgba(255,255,255,0.22)' : 'transparent', borderRadius: 10, padding: 8, alignItems: 'center', borderWidth: selectedMadhab === 1 ? 2 : 0, borderColor: selectedMadhab === 1 ? '#f7e8a4' : 'transparent' }}
                onPress={async () => {
                  const oldMadhab = selectedMadhab;
                  setSelectedMadhab(1);
                  try {
                    await AsyncStorage.setItem('selectedMadhab', '1');
                    // If Madhab changed and user had Asr notifications enabled, cancel old notification
                    if (oldMadhab !== 1 && prayerNotifications.Asr && notificationIds.Asr && notificationIds.Asr.id) {
                      await cancelPrayerNotification(notificationIds.Asr.id);
                      await removePersistedId('Asr');
                      setNotificationIds((prev) => ({ ...prev, Asr: null }));
                    }
                  } catch (e) {
                    console.warn('Failed to save Madhab selection', e);
                  }
                }}
              >
                <Text style={{ color: '#f7e8a4', fontWeight: 'bold', fontSize: 15 }}>Hanafi</Text>
                <Text style={{ color: theme.white, fontSize: 12 }}>Later Asr</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.glassyPrayerTimeGrid}>
            {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
              <Animated.View
                key={prayer}
                style={[
                  styles.glassyPrayerTimeCard,
                  currentPrayer === prayer && styles.currentPrayerCard,
                  currentPrayer === prayer && {
                    transform: [{
                      scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.15]
                      })
                    }],
                    opacity: fadeAnim
                  }
                ]}
              >
                <View style={styles.prayerTimeContent}>
                  <Text style={[
                    styles.prayerName,
                    { color: '#f7e8a4', textShadowColor: '#00515f', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
                    currentPrayer === prayer && styles.currentPrayerName
                  ]}>
                    {prayer === 'Asr' ? `Asr (${selectedMadhab === 0 ? 'Shafi’i' : 'Hanafi'})` : prayer}
                  </Text>
                  <Text style={[
                    styles.prayerTime,
                    { color: theme.white, fontWeight: 'bold', fontSize: 17 },
                    currentPrayer === prayer && styles.currentPrayerTime
                  ]}>
                    {prayerTimes[prayer] ? formatTo12Hour(prayerTimes[prayer]) : '--:--'}
                  </Text>
                  {currentPrayer === prayer && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                  {/* Notification toggle button */}
                  <TouchableOpacity
                    style={{ marginTop: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', gap: 6 }}
                    onPress={async () => {
                      const isOn = !prayerNotifications[prayer];
                      setPrayerNotifications((prev) => ({
                        ...prev,
                        [prayer]: isOn,
                      }));
                          if (isOn) {
                            // Schedule notification
                            if (prayerTimes[prayer]) {
                              const id = await schedulePrayerNotification(prayer, prayerTimes[prayer], `It's time for ${prayer} prayer.`);
                              setNotificationIds((prev) => ({ ...prev, [prayer]: { id, time: prayerTimes[prayer] } }));
                              await persistScheduledId(prayer, id, prayerTimes[prayer]);
                            }
                          } else {
                            // Cancel notification
                            if (notificationIds[prayer] && notificationIds[prayer].id) {
                              await cancelPrayerNotification(notificationIds[prayer].id);
                              await removePersistedId(prayer);
                              setNotificationIds((prev) => ({ ...prev, [prayer]: null }));
                            }
                          }
                      Alert.alert(
                        `${prayer} Notification`,
                        `Notifications for ${prayer} are now ${isOn ? 'ON' : 'OFF'}.`,
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <Ionicons
                      name={prayerNotifications[prayer] ? 'notifications' : 'notifications-off-outline'}
                      size={18}
                      color={prayerNotifications[prayer] ? '#2ecc71' : theme.textLight}
                    />
                    <Text style={{ fontSize: 12, color: prayerNotifications[prayer] ? '#2ecc71' : theme.textLight, fontWeight: 'bold' }}>
                      {prayerNotifications[prayer] ? 'On' : 'Off'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
          {/* Linear Timeline for Prayer Times */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineBar}>
              {/* Progress Bar (absolute, behind dots) */}
              <View style={[styles.timelineProgress, { width: `${getTimelineProgress(prayerTimes, currentTime)}%`, maxWidth: '100%', left: 0 }]} />
              {/* Timeline Dots and Labels */}
              {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer, idx, arr) => (
                <View key={prayer} style={[styles.timelineDotWrap, idx === 0 ? { alignItems: 'flex-start' } : {}, idx === arr.length - 1 ? { alignItems: 'flex-end' } : {}] }>
                  <View style={[styles.timelineDot, currentPrayer === prayer && styles.timelineDotActive]} />
                  <Text style={[styles.timelineLabel, currentPrayer === prayer && styles.timelineLabelActive]}>{prayer}</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Credit text below Prayer Times card */}
          <Text style={styles.creditText}>
            Prayer times provided by Aladhan
          </Text>
        </LinearGradient>

        {/* Quick Access Card for More, Settings, and Donate Us */}
        <LinearGradient
          colors={["#0f2027", "#00515f", "#368a95"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.glassyPrayerCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }]}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="flash-outline" size={20} color="#f7e8a4" style={{ marginRight: 10 }} />
            <Text style={[styles.sectionTitle, { fontSize: 15, color: '#f7e8a4', textShadowColor: '#00515f', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>Quick Access</Text>
          </View>
          <TouchableOpacity style={styles.quickAccessItem} onPress={() => navigation.navigate('More')}>
            <Ionicons name="ellipsis-horizontal" size={28} color="#f7e8a4" />
            <Text style={styles.quickAccessText}>More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAccessItem} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={28} color="#f7e8a4" />
            <Text style={styles.quickAccessText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAccessItem} onPress={() => navigation.navigate('DonateUs')}>
            <Ionicons name="heart-outline" size={28} color="#ffd700" />
            <Text style={[styles.quickAccessText, { color: '#ffd700' }]}>Donate Us</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Ramadan Fasting Times Card */}
        <LinearGradient
          colors={["#0f2027", "#00515f", "#368a95"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassyPrayerCard}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="moon-outline" size={24} color="#f7e8a4" />
            <Text style={[styles.sectionTitle, { color: '#f7e8a4', textShadowColor: '#00515f', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>Fasting Times</Text>
          </View>
          <View style={styles.fastingTimesGrid}>
            <View style={[styles.fastingTimeCard, { backgroundColor: 'rgba(255,255,255,0.13)', borderColor: '#f7e8a4', borderWidth: 1.5 }] }>
              <Ionicons name="restaurant-outline" size={22} color="#f7e8a4" style={{ marginBottom: 6 }} />
              <Text style={[styles.fastingLabel, { color: '#f7e8a4' }]}>Suhoor</Text>
              <Text style={[styles.fastingTime, { color: theme.white }]}>{prayerTimes.Imsak ? formatTo12Hour(prayerTimes.Imsak) : '--:--'}</Text>
            </View>
            <View style={[styles.fastingTimeCard, { backgroundColor: 'rgba(255,255,255,0.13)', borderColor: '#f7e8a4', borderWidth: 1.5 }] }>
              <Ionicons name="water-outline" size={22} color="#f7e8a4" style={{ marginBottom: 6 }} />
              <Text style={[styles.fastingLabel, { color: '#f7e8a4' }]}>Iftar</Text>
              <Text style={[styles.fastingTime, { color: theme.white }]}>{prayerTimes.Maghrib ? formatTo12Hour(prayerTimes.Maghrib) : '--:--'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Islamic Date Card */}
        <LinearGradient
          colors={["#0f2027", "#00515f", "#368a95"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassyPrayerCard}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={24} color="#f7e8a4" />
            <Text style={[styles.sectionTitle, { color: '#f7e8a4', textShadowColor: '#00515f', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>Islamic Date</Text>
          </View>
          {arabicDateInfo && (
            <View style={[styles.infoCard, { backgroundColor: 'rgba(255,255,255,0.13)', borderColor: '#f7e8a4', borderWidth: 1.5 }] }>
              <Text style={[styles.infoText, { color: theme.white }] }>
                {arabicDateInfo.data.hijri.date} | {arabicDateInfo.data.hijri.year} AH
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Add space at the bottom for visual comfort above the tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  creditText: {
    fontSize: 12,
    color: 'rgba(44,62,80,0.55)',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.textLight,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3f3',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
  },
  errorText: {
    marginLeft: 8,
    color: theme.accent,
    fontSize: 14,
    flex: 1,
  },
  greetingContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.primary,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 15,
    color: theme.textLight,
    marginTop: 2,
  },
  quranQuoteCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  quranIcon: {
    marginBottom: 8,
  },
  quranAyahArabic: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.primary,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'sans-serif',
  },
  quranAyahTranslation: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  quranAyahMeta: {
    fontSize: 13,
    color: theme.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  nextQuoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.primary + '10',
  },
  nextQuoteText: {
    color: theme.primary,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: theme.white,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginLeft: 8,
  },
  prayerTimesContainer: {
    paddingRight: 16,
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    // Fix: Ensure cards wrap correctly and don't overflow
    rowGap: 12, // Add vertical spacing between rows (RN 0.71+)
    columnGap: 8, // Add horizontal spacing between columns (RN 0.71+)
  },
  prayerTimeCard: {
    backgroundColor: theme.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 0,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: 'transparent',
    elevation: 0,
  },
  glassyPrayerCard: {
    borderRadius: 22,
    padding: 18,
    marginVertical: 12,
    marginHorizontal: 8,
    backgroundColor: 'rgba(15,32,39,0.55)',
    shadowColor: '#00515f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    borderWidth: 2,
    borderColor: '#f7e8a4',
    overflow: 'hidden',
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 8,
    shadowColor: '#00515f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    borderWidth: 2,
    borderColor: '#f7e8a4',
    overflow: 'hidden',
  },
  glassyPrayerTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  glassyPrayerTimeCard: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f7e8a4',
    shadowColor: '#00515f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  prayerTimeContent: {
    alignItems: 'center',
  },
  currentPrayerCard: {
    borderColor: '#ffd700',
    borderWidth: 2.5,
    shadowColor: '#ffd700',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    backgroundColor: 'rgba(55, 80, 120, 0.22)',
  },
  prayerName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  prayerTime: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.93)',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoText: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
  },
  productsContainer: {
    paddingRight: 16,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  moreButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  currentBadge: {
    backgroundColor: '#ffd700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  currentBadgeText: {
    color: '#00515f',
    fontWeight: 'bold',
    fontSize: 12,
  },
  currentPrayerName: {
    color: '#ffd700',
    textShadowColor: '#00515f',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  currentPrayerTime: {
    color: '#ffd700',
  },
  fastingTimesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  fastingTimeCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 18,
    marginHorizontal: 4,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.primary + '22',
  },
  fastingLabel: {
    fontSize: 16,
    color: theme.text,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  fastingTime: {
    fontSize: 20,
    color: theme.primary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  topCardWrap: {
    flexDirection: 'row',
    backgroundColor: 'linear-gradient(90deg, #0f2027 0%, #2c5364 100%)', // fallback for web, but for RN use gradient below
    borderRadius: 22,
    margin: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    gap: 12,
    // For React Native, use a LinearGradient wrapper instead of backgroundColor
  },
  topCardLeft: {
    flex: 1.1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    minWidth: 120,
    maxWidth: 160,
  },
  topCardRight: {
    flex: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    minHeight: 70,
    minWidth: 0,
    maxWidth: 220,
    alignItems: 'flex-start',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  quranAyahShort: {
    fontSize: 15,
    color: theme.text,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'left',
  },
  quranAyahMetaSmall: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 2,
    textAlign: 'left',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  timelineContainer: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  timelineBar: {
    position: 'relative',
    width: '100%',
    height: 54,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    overflow: 'visible',
  },
  timelineDotWrap: {
    alignItems: 'center',
    width: '16%',
    position: 'relative',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f7e8a4',
    borderWidth: 2,
    borderColor: '#00515f',
    marginBottom: 2,
    shadowColor: '#00515f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  timelineDotActive: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  timelineLabel: {
    fontSize: 12,
    color: theme.white,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#ffd700',
    fontWeight: 'bold',
    textShadowColor: '#00515f',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  timelineTime: {
    fontSize: 11,
    color: theme.textLight,
    marginTop: 1,
    textAlign: 'center',
  },
  timelineProgress: {
    position: 'absolute',
    top: 0, // Move progress bar higher above dots
    left: 8,
    height: 4,
    backgroundColor: '#ffd700',
    borderRadius: 2,
    zIndex: 1,
  },
  quickAccessItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  quickAccessText: {
    color: '#f7e8a4',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default HomeScreen;
