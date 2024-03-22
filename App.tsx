import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/components/HomeScreen';
import QuranScreen from './src/components/QuranScreen';
import QiblaScreen from './src/components/QiblaScreen';
import RamadanScreen from './src/components/RamadanScreen'; // Update the import path
import ZakatCalculatorScreen from './src/components/ZakatCalculatorScreen'; // Update the import path

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Quran" component={QuranScreen} />
        <Tab.Screen name="Qibla" component={QiblaScreen} />
        <Tab.Screen name="Ramazan Timing" component={RamadanScreen} />
        <Tab.Screen name="ZakatCalculator" component={ZakatCalculatorScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
