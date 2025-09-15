import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import HomeScreen from './HomeScreen';
import QuranScreen from './QuranScreen';
import QiblaScreen from './QiblaScreen';
import ScrollTasbih from './ScrollTasbih';
import MoreScreen from './MoreScreen';
import DonateUs from './DonateUs';
import SettingsScreen from './SettingsScreen';
import ThemeScreen from './ThemeScreen';
import NotificationsScreen from './NotificationsScreen';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

const MainTabNavigatorInner = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = size;
          let iconStyle = {};
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Quran') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Qibla') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Tasbih') {
            iconName = focused ? 'repeat' : 'repeat-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
            iconSize = size + 12;
            iconStyle = {
              backgroundColor: focused ? '#f7e8a4' : 'rgba(255,255,255,0.18)',
              borderRadius: 28,
              padding: 8,
              borderWidth: 2,
              borderColor: focused ? 'rgba(54,138,149,0.5)' : 'rgba(234,246,251,0.5)',
              shadowColor: focused ? '#f7e8a4' : '#368a95',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: focused ? 0.6 : 0.22,
              shadowRadius: focused ? 16 : 8,
              elevation: focused ? 12 : 4,
            };
            return (
              <View style={iconStyle}>
                <Ionicons name={iconName} size={iconSize} color={color} />
              </View>
            );
          }
          return (
            <View style={iconStyle}>
              <Ionicons name={iconName} size={iconSize} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: '#f7e8a4',
        tabBarInactiveTintColor: '#eaf6fb',
        tabBarBackground: () => (
          <LinearGradient
            colors={[theme.secondary + 'CC', theme.primary + 'CC', '#eaf6fbCC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, width: '100%', height: '100%', position: 'absolute', borderRadius: 36 }}
          >
            <BlurView
              intensity={36}
              tint="light"
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                borderRadius: 36,
                backgroundColor: 'rgba(255,255,255,0.10)',
              }}
            />
          </LinearGradient>
        ),
        tabBarStyle: {
          height: 80,
          paddingBottom: 22,
          paddingTop: 12,
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 18,
          borderRadius: 36,
          borderWidth: 1.5,
          borderColor: '#eaf6fb',
          overflow: 'hidden',
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.28,
          shadowRadius: 32,
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          textShadowColor: theme.shadow,
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
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
          fontSize: 20,
          color: theme.white,
          letterSpacing: 1,
        },
        headerTitleAlign: 'center',
      })}
      sceneContainerStyle={{ backgroundColor: theme.background, flex: 1 }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Quran" component={QuranScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
      <Tab.Screen name="Qibla" component={QiblaScreen} />
      <Tab.Screen name="Tasbih" component={ScrollTasbih} />
      <Tab.Screen name="DonateUs" component={DonateUs} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Theme" component={ThemeScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
};

export default function MainTabNavigator() {
  return (
    <ThemeProvider>
      <MainTabNavigatorInner />
    </ThemeProvider>
  );
}
