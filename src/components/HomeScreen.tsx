import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';// Import CheckBox component
import * as Location from 'expo-location';
import axios from 'axios';

const HomeScreen: React.FC = () => {
  const [numProductsToShow, setNumProductsToShow] = useState(4);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>({});
  const [locationName, setLocationName] = useState('');
  const [dateInfo, setDateInfo] = useState<any>(null);
  const [arabicDateInfo, setArabicDateInfo] = useState<any>(null);
  const [formattedDate, setFormattedDate] = useState('');
  const [ramadanFastingTimes, setRamadanFastingTimes] = useState<any>({});

  useEffect(() => {
    // Fetch current location
    getLocation();
    // Fetch date information
    fetchDateInfo();
    // Fetch Arabic date information
    fetchArabicDateInfo();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      getPrayerTimes();
      reverseGeocode();
    }
  }, [currentLocation]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };
  

  const fetchDateInfo = async () => {
    const updateTime = () => {
      const currentTime = new Date();
      const formattedDate = currentTime.toLocaleDateString();
      const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
      // Set the formatted date and time
      setFormattedDate(`Date: ${formattedDate} | Time: ${formattedTime}`);
    };
  
    updateTime(); // Update time immediately
  
    const interval = setInterval(updateTime, 2000); // Update time every minute
  
    try {
      const response = await axios.get('http://worldtimeapi.org/api/ip');
      const { datetime } = response.data;
      const formattedDate = new Date(datetime).toLocaleDateString();
      const formattedTime = new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
      // Set the formatted date and time
      setFormattedDate(`Date: ${formattedDate} | Time: ${formattedTime}`);
    } catch (error) {
      console.error('Error fetching date info:', error);
    }
  
    return () => clearInterval(interval); // Clean up interval
  };
  

  const fetchArabicDateInfo = async () => {
    try {
      const response = await axios.get('https://api.aladhan.com/v1/gToH');
      setArabicDateInfo(response.data);
    } catch (error) {
      console.error('Error fetching Arabic date info:', error);
    }
  };

  const getPrayerTimes = async () => {
    if (!currentLocation) {
      console.error('Current location is not available.');
      return;
    }

    const { latitude, longitude } = currentLocation;
    const method = 2; // Choose the desired prayer times calculation method
    const apiUrl = `http://api.aladhan.com/v1/calendar/${new Date().getFullYear()}/${new Date().getMonth() + 1}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data.data[0].timings;
      const ramadanFastingTimes = {
        Imsak: data.Imsak,
        Maghrib: data.Maghrib,
      };
      setPrayerTimes(ramadanFastingTimes);
      setPrayerTimes(data);
    } catch (error) {
      console.error('Error fetching prayer times:', error.message);
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



  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: 'https://picsum.photos/1920/1080' }}
        style={styles.banner}
      />

      {/* Location */}
      {currentLocation && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Your Location: {locationName}
          </Text>
        </View>
      )}

      {/* Namaz (Prayer) Times */}
      <View style={styles.section}>
  <Text style={styles.header}>Namaz (Prayer) Times</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {Object.entries(prayerTimes).map(([namaz, time]) => (
      <View key={namaz} style={styles.namazContainer}>
        <Text style={styles.namazName}>{namaz}</Text>
        <Text style={styles.namazTime}>{String(time)}</Text>
      </View>
    ))}
  </ScrollView>
</View>

{/* Ramadan Fasting Times */}
<View style={styles.section}>
  <Text style={styles.header}>Ramadan Fasting Times</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={styles.namazContainer}>
      <Text style={styles.namazName}>Suhar</Text>
      <Text style={styles.namazTime}>{prayerTimes.Imsak}</Text>
    </View>
    <View style={styles.namazContainer}>
      <Text style={styles.namazName}>Iftar</Text>
      <Text style={styles.namazTime}>{prayerTimes.Maghrib}</Text>
    </View>
  </ScrollView>
</View>



      {/* Date and Time Information */}
      <View style={styles.section}>
        <Text style={styles.header}>Date and Time Information</Text>
        {formattedDate && (
          <View style={styles.dateAndTimeContainer}>
            <Text style={styles.dateAndTimeText}>{formattedDate}</Text>
          </View>
        )}
      </View>

      {/* Arabic Date Information */}
      <View style={styles.section}>
        <Text style={styles.header}>Arabic Date Information</Text>
        {arabicDateInfo && (
          <View style={styles.dateAndTimeContainer}>
            <Text style={styles.dateAndTimeText}>
              Arabic Date: {arabicDateInfo.data.hijri.date} | Arabic Year: {arabicDateInfo.data.hijri.year}
            </Text>
          </View>
        )}
      </View>

      {/* Popular Products Section */}
      <View style={styles.section}>
        <Text style={styles.header}>Popular Products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* ... (existing product UI) */}
        </ScrollView>

        <TouchableOpacity
          onPress={() => {}}
          style={styles.moreProductsButton}
        >
          <Text style={styles.moreProductsButtonText}>
            {numProductsToShow === 4 ? 'More Products' : 'Less Products'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  banner: {
    height: 400,
    width: '100%',
  },
  locationContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: 'black',
  },
  section: {
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  namazContainer: {
    marginRight: 16,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  namazName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  namazTime: {
    fontSize: 14,
    color: 'gray',
  },
  weekdayContainer: {
    marginRight: 16,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center', // Center the checkbox
  },
  weekdayName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  checkbox: {
    alignSelf: 'center',
  },
  dateAndTimeContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  dateAndTimeText: {
    fontSize: 16,
    color: 'black',
  },
  productContainer: {
    marginRight: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  moreProductsButton: {
    backgroundColor: '#FFD814',
    borderRadius: 8,
    padding: 8,
    marginTop: 16,
  },
  moreProductsButtonText: {
    color: 'white',
    textAlign: 'center',
  },

  ramadanFastingContainer: {
    marginRight: 16,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  ramadanFastingDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ramadanFastingTime: {
    fontSize: 14,
    color: 'gray',
  },

});

export default HomeScreen;
