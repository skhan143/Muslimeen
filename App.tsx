import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, Platform } from 'react-native';
import MainTabNavigator from './src/components/MainTabNavigator';
import IntroScreen from './src/components/IntroScreen';
import DonateUs from './src/components/DonateUs';

// Define theme colors<SkylightCalendarScreen prayerTimesFromHome={prayerTimes} />
const theme = {
  primary: '#00515f',
  secondary: '#368a95',
  accent: '#e74c3c',
  background: '#eaf6fb',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  white: '#ffffff',
  border: '#e0e0e0',
  shadow: '#000000',
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    if (!showIntro) {
      setShowDonate(true);
      const timer = setTimeout(() => setShowDonate(false), 3000); // Show for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  if (showIntro) {
    return <IntroScreen onFinish={() => setShowIntro(false)} />;
  }

  if (showDonate) {
    return <DonateUs />;
  }

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#b2f2d7"
      />
      <MainTabNavigator />
    </NavigationContainer>
  );
};

export default App;
