import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Platform } from 'react-native';
import HomeScreen from './src/components/HomeScreen';
import QuranScreen from './src/components/QuranScreen';
import QiblaScreen from './src/components/QiblaScreen';
import RamadanScreen from './src/components/RamadanScreen';
import ZakatCalculatorScreen from './src/components/ZakatCalculatorScreen';

// Define theme colors
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

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.primary}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Quran') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Qibla') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'Ramazan Timing') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'ZakatCalculator') {
              iconName = focused ? 'calculator' : 'calculator-outline';
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textLight,
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            paddingTop: 10,
            backgroundColor: theme.white,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            elevation: 8,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: theme.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Home',
          }}
        />
        <Tab.Screen 
          name="Quran" 
          component={QuranScreen}
          options={{
            title: 'Quran',
          }}
        />
        <Tab.Screen 
          name="Qibla" 
          component={QiblaScreen}
          options={{
            title: 'Qibla',
          }}
        />
        <Tab.Screen 
          name="Ramazan Timing" 
          component={RamadanScreen}
          options={{
            title: 'Ramadan Timing',
          }}
        />
        <Tab.Screen 
          name="ZakatCalculator" 
          component={ZakatCalculatorScreen}
          options={{
            title: 'Zakat Calculator',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
