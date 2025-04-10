import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
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
import { Ionicons } from '@expo/vector-icons';

// Theme colors (matching App.tsx)
const theme = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  background: '#f8f9fa',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  white: '#ffffff',
  border: '#e0e0e0',
  shadow: '#000000',
};

const HomeScreen: React.FC = () => {
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
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    fetchAllData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Enhanced wave animation with more noticeable effect
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

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentLocation) {
      getPrayerTimes();
      reverseGeocode();
    }
  }, [currentLocation]);

  useEffect(() => {
    if (prayerTimes) {
      determineCurrentPrayer();
    }
  }, [currentTime, prayerTimes]);

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

  const fetchDateInfo = async () => {
    const updateTime = () => {
      const currentTime = new Date();
      const formattedDate = currentTime.toLocaleDateString();
      const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setFormattedDate(`Date: ${formattedDate} | Time: ${formattedTime}`);
    };

    updateTime(); // Update time immediately
    const interval = setInterval(updateTime, 60000); // Update time every minute

    try {
      const response = await axios.get('http://worldtimeapi.org/api/ip');
      const { datetime } = response.data;
      const formattedDate = new Date(datetime).toLocaleDateString();
      const formattedTime = new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setFormattedDate(`Date: ${formattedDate} | Time: ${formattedTime}`);
    } catch (error) {
      console.error('Error fetching date info:', error);
      // Fallback to local time if API fails
      updateTime();
    }

    return () => clearInterval(interval);
  };

  const fetchArabicDateInfo = async () => {
    try {
      const response = await axios.get('https://api.aladhan.com/v1/gToH');
      setArabicDateInfo(response.data);
    } catch (error) {
      console.error('Error fetching Arabic date info:', error);
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
    const apiUrl = `http://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data?.data?.timings) {
        const data = response.data.data.timings;
        setPrayerTimes(data);
        const ramadanFastingTimes = {
          Imsak: data.Imsak,
          Maghrib: data.Maghrib,
        };
        setRamadanFastingTimes(ramadanFastingTimes);
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setError('Unable to fetch prayer times. Please try again later.');
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </View>
    );
  }

  return (
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
    >
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={theme.accent} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Image
        source={{ uri: 'https://picsum.photos/1920/1080' }}
        style={styles.banner}
        resizeMode="cover"
      />

      {/* Location */}
      {currentLocation && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color={theme.primary} />
          <Text style={styles.locationText}>
            {locationName || 'Your Location'}
          </Text>
        </View>
      )}

      {/* Namaz (Prayer) Times */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={24} color={theme.primary} />
          <Text style={styles.sectionTitle}>Prayer Times</Text>
        </View>
        <View style={styles.prayerTimesGrid}>
          {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
            <Animated.View
              key={prayer}
              style={[
                styles.prayerTimeCard,
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
                  currentPrayer === prayer && styles.currentPrayerName
                ]}>
                  {prayer}
                </Text>
                <Text style={[
                  styles.prayerTime,
                  currentPrayer === prayer && styles.currentPrayerTime
                ]}>
                  {prayerTimes[prayer] || '--:--'}
                </Text>
                {currentPrayer === prayer && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Ramadan Fasting Times */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="moon-outline" size={24} color={theme.primary} />
          <Text style={styles.sectionTitle}>Ramadan Fasting Times</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prayerTimesContainer}
        >
          <View style={styles.prayerTimeCard}>
            <Text style={styles.prayerName}>Suhar</Text>
            <Text style={styles.prayerTime}>{prayerTimes.Imsak}</Text>
          </View>
          <View style={styles.prayerTimeCard}>
            <Text style={styles.prayerName}>Iftar</Text>
            <Text style={styles.prayerTime}>{prayerTimes.Maghrib}</Text>
          </View>
        </ScrollView>
      </View>

      {/* Arabic Date Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="book-outline" size={24} color={theme.primary} />
          <Text style={styles.sectionTitle}>Islamic Date</Text>
        </View>
        {arabicDateInfo && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {arabicDateInfo.data.hijri.date} | {arabicDateInfo.data.hijri.year} AH
            </Text>
          </View>
        )}
      </View>

      {/* Popular Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={24} color={theme.primary} />
          <Text style={styles.sectionTitle}>Popular Products</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
        >
          {/* Product cards would go here */}
        </ScrollView>

        <TouchableOpacity
          onPress={toggleProducts}
          style={styles.moreButton}
        >
          <Ionicons 
            name={numProductsToShow === 4 ? "chevron-down-outline" : "chevron-up-outline"} 
            size={20} 
            color={theme.white} 
          />
          <Text style={styles.moreButtonText}>
            {numProductsToShow === 4 ? 'Show More' : 'Show Less'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
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
  banner: {
    height: 200,
    width: '100%',
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
  },
  prayerTimeCard: {
    backgroundColor: theme.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  prayerTimeContent: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  prayerTime: {
    fontSize: 16,
    color: theme.textLight,
  },
  infoCard: {
    backgroundColor: theme.white,
    padding: 16,
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
  currentPrayerCard: {
    backgroundColor: theme.primary + '10',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  currentBadgeText: {
    color: theme.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentPrayerName: {
    color: theme.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  currentPrayerTime: {
    color: theme.primary,
    fontSize: 20,
    fontWeight: '600',
  },
});

export default HomeScreen;
