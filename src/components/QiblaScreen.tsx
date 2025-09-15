import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react";

import PropTypes from "prop-types";
import {
  Image,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { Magnetometer } from "expo-sensors";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { moderateScale } from "react-native-size-matters";
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Degrees within which we consider the device to be facing Qibla
const VIBRATION_THRESHOLD = 10;

export const useQiblaCompass = () => {
  const subscriptionRef = useRef<any>(null);
  const [magnetometer, setMagnetometer] = useState(0);
  const [qiblad, setQiblad] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasVibratedRef = useRef(false);
  const isFocused = useIsFocused();

  // Normalize angle to be between 0–359
  const normalizeAngle = (angle: number) => (angle + 360) % 360;

  const initCompass = useCallback(async () => {
    const isAvailable = await Magnetometer.isAvailableAsync();
    if (!isAvailable) {
      setError("Compass is not available on this device");
      setIsLoading(false);
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Location permission not granted");
      setIsLoading(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      calculateQibla(latitude, longitude);
      subscribe();
    } catch (err) {
      setError("Failed to get location.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribe = () => {
    Magnetometer.setUpdateInterval(100);
    subscriptionRef.current = Magnetometer.addListener((data) => {
      setMagnetometer(getCompassAngle(data));
    });
  };

  const unsubscribe = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  };

  useEffect(() => {
    initCompass();
    return unsubscribe;
  }, []);

  const getCompassAngle = (magnetometer: any) => {
    const { x, y } = magnetometer;
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return normalizeAngle(angle);
  };

  const getDirectionLabel = (degree: number) => {
    if (degree >= 22.5 && degree < 67.5) return "NE";
    if (degree >= 67.5 && degree < 112.5) return "E";
    if (degree >= 112.5 && degree < 157.5) return "SE";
    if (degree >= 157.5 && degree < 202.5) return "S";
    if (degree >= 202.5 && degree < 247.5) return "SW";
    if (degree >= 247.5 && degree < 292.5) return "W";
    if (degree >= 292.5 && degree < 337.5) return "NW";
    return "N";
  };

  const getAdjustedDegree = (magnetometer: number) => (magnetometer + 270) % 360;

  const calculateQibla = (latitude: number, longitude: number) => {
    const PI = Math.PI;
    const latK = (21.4225 * PI) / 180;
    const longK = (39.8264 * PI) / 180;
    const phi = (latitude * PI) / 180;
    const lambda = (longitude * PI) / 180;

    const angle =
      (180 / PI) *
      Math.atan2(
        Math.sin(longK - lambda),
        Math.cos(phi) * Math.tan(latK) - Math.sin(phi) * Math.cos(longK - lambda)
      );

    setQiblad(normalizeAngle(angle));
  };

  const compassDegree = getAdjustedDegree(magnetometer);
  const compassDirection = getDirectionLabel(compassDegree);
  const compassRotate = 360 - compassDegree;
  const kabaRotate = compassRotate + qiblad;

  // Vibration logic
  // Point-wise haptic feedback: only on significant movement, increases as you get closer
  const lastDeltaRef = useRef<number | null>(null);
  useEffect(() => {
    if (isLoading || !isFocused) return;

    const difference = Math.abs(qiblad - compassDegree);
    const delta = Math.min(difference, 360 - difference); // handles circular degree comparison

    // Only give feedback if delta changes by at least 2 degrees
    if (lastDeltaRef.current === null || Math.abs(delta - lastDeltaRef.current) >= 4) {
      if (delta <= VIBRATION_THRESHOLD) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (delta <= 20) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      lastDeltaRef.current = delta;
    }
  }, [qiblad, compassDegree, isLoading, isFocused]);

  return {
    qiblad,
    compassDegree,
    compassDirection,
    compassRotate,
    kabaRotate,
    error,
    isLoading,
    reinitCompass: initCompass,
  };
};

// Component props
type QiblaScreenProps = {
  backgroundColor?: string;
  color?: string;
  textStyles?: Record<string, any>;
};

const QiblaScreen = forwardRef<any, QiblaScreenProps>((
  { backgroundColor = "transparent", color = "#00515f", textStyles = {} }, ref
) => {
  const {
    qiblad,
    compassDegree,
    compassDirection,
    compassRotate,
    kabaRotate,
    error,
    isLoading,
    reinitCompass,
  } = useQiblaCompass();

  const angleDelta = Math.abs(qiblad - compassDegree);

  useImperativeHandle(ref, () => ({ reinitCompass }), []);

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#eaf6fb", "#ffffff", "#368a95"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size={50} color="#00515f" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#eaf6fb", "#ffffff", "#368a95"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Move instructional text to the very top of the screen */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 10, position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        <Text style={{
          color: '#00515f',
          fontSize: 15,
          fontWeight: 'bold',
          textAlign: 'center',
          letterSpacing: 0.2,
          marginBottom: 0,
        }}>
          Please keep your phone flat for best accuracy.
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient
          colors={["#ffffffCC", "#eaf6fbCC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 18, padding: 18, margin: 18 }}
        >
          <BlurView intensity={60} tint="light" style={{ borderRadius: 18 }}>
            <View style={[styles.container, { backgroundColor: 'transparent' }]}> 
                {error && (
                  <Text style={[styles.errorText, textStyles]}>
                    Error: {error}
                  </Text>
                )}
                <View style={styles.direction}>
                  <Text style={[styles.directionText, { color: '#00515f', ...textStyles }]}> 
                    {compassDirection}
                  </Text>
                  <Text style={[styles.directionText, { color: '#00515f', ...textStyles }]}> 
                    {compassDegree.toFixed(0)}°
                  </Text>
                </View>

                <View style={{ marginBottom: 10 }}>
                  {angleDelta <= 10 ? (
                    <Text style={{ fontSize: 20, color: "#1bc700", fontWeight: "bold", textShadowColor: '#b6ffb6', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 8 }}>Qibla Found!</Text>
                  ) : angleDelta <= 20 ? (
                    <Text style={{ fontSize: 18, color: "#ff9800", fontWeight: "bold", textShadowColor: '#ffe0b2', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 6 }}>Almost There...</Text>
                  ) : (
                    <Text style={{ fontSize: 18, color: "#e53935", fontWeight: "bold", textShadowColor: '#ffcdd2', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 4 }}>Keep Rotating</Text>
                  )}
                </View>

                <View style={styles.compassWrapper}>
                  {/* Qibla Arrow Overlay (on top, always points up) */}
                  <View style={styles.arrowOverlay} pointerEvents="none">
                    <View style={styles.arrowContainer}>
                      <View style={angleDelta <= 10 ? [styles.arrowHead, styles.arrowGlow] : styles.arrowHead} />
                      <View style={angleDelta <= 10 ? [styles.arrowShaft, styles.arrowGlow] : styles.arrowShaft} />
                    </View>
                  </View>
                  <Image
                    source={require("../Assets/images/compass.png")}
                    style={[styles.image, { transform: [{ rotate: `${compassRotate}deg` }], marginTop: moderateScale(40, 0.25) }]}
                  />
                  <View
                    style={[styles.kabaOverlay, { transform: [{ rotate: `${kabaRotate}deg` }], marginTop: moderateScale(40, 0.25) }]}
                  >
                    <Image
                      source={require("../Assets/images/kaba.png")}
                      style={styles.kabaImage}
                    />
                  </View>
                </View>

                {/* Add extra spacing below compass for Qibla angle */}
                <View style={{ height: 32 }} />
                <View style={[styles.qiblaDirection, { marginTop: 12, padding: 12, borderRadius: 16, backgroundColor: '#eaf6fbCC', alignSelf: 'center', minWidth: 120, justifyContent: 'center', alignItems: 'center', shadowColor: '#368a95', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 2 }] }>
                  <Image
                    source={require("../Assets/images/kaba.png")}
                    style={styles.kabaIcon}
                  />
                  <Text style={{
                    fontSize: 28,
                    color: '#00515f',
                    fontWeight: 'bold',
                    marginLeft: 10,
                    letterSpacing: 1.5,
                    textShadowColor: '#eaf6fb',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                    backgroundColor: 'transparent',
                  }}>
                    {qiblad.toFixed(2)}°
                  </Text>
                </View>

                {/* Move instructional text directly below Qibla angle card for better visibility */}
                <View style={{ marginTop: 3, marginBottom: 3 }}>
                  <Text style={{ color: '#2c3e50', fontSize: 12, textAlign: 'center', fontWeight: '400', opacity: 0.85 }}>
                    Please keep your phone flat and facing towards the Qibla direction for best accuracy.
                  </Text>
                </View>
              </View>
            </BlurView>
          </LinearGradient>
        </View>
    </LinearGradient>
    );
  }
);

QiblaScreen.propTypes = {
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  textStyles: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  errorText: {
    color: "#f00",
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 20,
    fontSize: moderateScale(16, 0.25),
  },
  direction: {
    textAlign: "center",
    zIndex: 300,
  },
  directionText: {
    textAlign: "center",
    fontSize: 30,
    color: "#468773",
  },
  compassWrapper: {
    width: "100%",
    height: moderateScale(300, 0.25),
    position: "relative",
  },
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    position: "absolute",
    top: 0,
    width: moderateScale(300, 0.25),
    height: moderateScale(300, 0.25),
  },
  kabaOverlay: {
    width: moderateScale(300, 0.25),
    height: moderateScale(300, 0.25),
    position: "absolute",
    alignSelf: "center",
    justifyContent: "center",
    flexDirection: "row",
    zIndex: 999,
  },
  kabaImage: {
    resizeMode: "center",
    height: 100,
    marginTop: 20,
    width: 60,
    zIndex: 999,
  },
  qiblaDirection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  kabaIcon: {
    width: moderateScale(35, 0.25),
    height: moderateScale(35, 0.25),
  },
  arrowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
    height: moderateScale(60, 0.25),
    width: "100%",
    pointerEvents: "none",
  },
  arrowContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    height: moderateScale(60, 0.25),
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 22,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#2e7d32",
    marginBottom: -2,
  },
  arrowShaft: {
    width: 4,
    height: 28,
    backgroundColor: "#2e7d32",
    borderRadius: 2,
  },
  arrowGlow: {
    shadowColor: '#1bc700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default QiblaScreen;
