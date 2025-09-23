import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import PropTypes from "prop-types";
import {
  Image,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
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
  const headingWatchRef = useRef<any>(null);
  const [heading, setHeading] = useState<number>(0);
  const [headingSmooth, setHeadingSmooth] = useState<number>(0);
  const [declination, setDeclination] = useState<number>(0);
  const declinationRef = useRef<number>(0);
  const [qiblad, setQiblad] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  // Normalize angle to be between 0–359
  const normalizeAngle = (angle: number) => (angle + 360) % 360;

  const initCompass = useCallback(async () => {
    const isAvailable = await Magnetometer.isAvailableAsync();
    if (!isAvailable) {
      // Continue anyway; OS heading may still be provided
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
      // Fetch approximate declination once per location (improves Android accuracy)
      fetchDeclination(latitude, longitude).catch(() => {});
      // Prefer OS-provided heading (tilt-compensated); fallback to raw magnetometer
      try {
        headingWatchRef.current = await Location.watchHeadingAsync((data: any) => {
          const trueH = typeof data?.trueHeading === 'number' && data.trueHeading >= 0 ? data.trueHeading : null;
          const magH = typeof data?.magHeading === 'number' ? data.magHeading : (typeof data?.magneticHeading === 'number' ? data.magneticHeading : null);
          let h = 0;
          if (trueH !== null) {
            h = trueH;
          } else if (magH !== null) {
            h = normalizeAngle(magH + (declinationRef.current || 0));
          } else if (typeof data?.heading === 'number') {
            h = normalizeAngle(data.heading);
          }
          setHeading(h);
        });
      } catch (e) {
        subscribe();
      }
    } catch (err) {
      setError("Failed to get location.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribe = () => {
    Magnetometer.setUpdateInterval(100);
    subscriptionRef.current = Magnetometer.addListener((data) => {
      setHeading(getCompassAngle(data));
    });
  };

  const unsubscribe = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    headingWatchRef.current?.remove?.();
    headingWatchRef.current = null;
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
  // Fetch magnetic declination from NOAA service (best-effort). Cached in ref/state.
  const fetchDeclination = useCallback(async (lat: number, lon: number) => {
    try {
      const year = new Date().getFullYear();
      const url = `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat=${lat}&lon=${lon}&startYear=${year}&resultFormat=json`;
      const res = await fetch(url);
      const json = await res.json();
      const findDecl = (obj: any): number | null => {
        if (!obj || typeof obj !== 'object') return null;
        for (const k of Object.keys(obj)) {
          const v = (obj as any)[k];
          if (typeof v === 'number' && k.toLowerCase().includes('declin')) return v;
          const nested = findDecl(v);
          if (nested !== null) return nested;
        }
        return null;
      };
      const dec = findDecl(json);
      if (typeof dec === 'number' && isFinite(dec)) {
        setDeclination(dec);
        declinationRef.current = dec;
      }
    } catch {
      // ignore network errors; stick with 0 declination
    }
  }, []);

  // Smooth heading to reduce jitter (wrap-aware)
  const smoothRef = useRef<number>(0);
  useEffect(() => {
    const prev = smoothRef.current;
    const curr = heading;
    const alpha = 0.15; // smoothing factor
    let delta = ((curr - prev + 540) % 360) - 180;
    const next = normalizeAngle(prev + alpha * delta);
    smoothRef.current = next;
    setHeadingSmooth(next);
  }, [heading]);

  const compassDegree = headingSmooth; // already true-heading when available
  const compassDirection = getDirectionLabel(compassDegree);
  const compassRotate = 360 - compassDegree;
  const kabaRotate = compassRotate + qiblad;

  // Vibration logic
  const lastDeltaRef = useRef<number | null>(null);
  useEffect(() => {
    if (isLoading || !isFocused) return;

    const difference = Math.abs(qiblad - compassDegree);
    const delta = Math.min(difference, 360 - difference); // handles circular degree comparison

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
  const arrowRotate = ((qiblad - compassDegree + 360) % 360);
  const kabaOverlayRotate = ((qiblad + compassDegree) % 360);

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
                    style={[styles.image as any, { transform: [{ rotate: `${compassRotate}deg` }], marginTop: moderateScale(40, 0.25) }]}
                  />
                  <View
                    style={[styles.kabaOverlay, { transform: [{ rotate: `${kabaRotate}deg` }], marginTop: moderateScale(40, 0.25) }]}
                  >
                    <Image
                      source={require("../Assets/images/kaba.png")}
                      style={styles.kabaImage as any}
                    />
                  </View>
                </View>

                <View style={{ height: 32 }} />
                <View style={[styles.qiblaDirection, { marginTop: 12, padding: 12, borderRadius: 16, backgroundColor: '#eaf6fbCC', alignSelf: 'center', minWidth: 120, justifyContent: 'center', alignItems: 'center', shadowColor: '#368a95', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 2 }] }>
                  <Image
                    source={require("../Assets/images/kaba.png")}
                    style={styles.kabaIcon as any}
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
});

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
  image: {
    resizeMode: "contain",
    alignSelf: "center",
    position: "absolute",
    top: 0,
    width: moderateScale(300, 0.25),
    height: moderateScale(300, 0.25),
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
  cardinalText: {
    position: 'absolute',
    color: '#b0bcc7',
    fontSize: 18,
    fontWeight: '700',
  },
  cardinalTop: {
    top: moderateScale(12, 0.25),
    alignSelf: 'center',
  },
  cardinalRight: {
    right: moderateScale(12, 0.25),
    top: '50%',
    transform: [{ translateY: -9 }],
  },
  cardinalBottom: {
    bottom: moderateScale(12, 0.25),
    alignSelf: 'center',
  },
  cardinalLeft: {
    left: moderateScale(12, 0.25),
    top: '50%',
    transform: [{ translateY: -9 }],
  },
  centeredOverlay: {
    position: 'absolute',
    width: moderateScale(300, 0.25),
    height: moderateScale(300, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  rotatingPlate: {
    position: 'absolute',
    width: moderateScale(300, 0.25),
    height: moderateScale(300, 0.25),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  outerRing: {
    width: moderateScale(300, 0.25),
    height: moderateScale(300, 0.25),
    borderRadius: moderateScale(150, 0.25),
    backgroundColor: '#f7f7f7',
    borderWidth: moderateScale(14, 0.25),
    borderColor: '#ebe7e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerFace: {
    width: moderateScale(240, 0.25),
    height: moderateScale(240, 0.25),
    borderRadius: moderateScale(120, 0.25),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tick: {
    position: 'absolute',
    width: moderateScale(6, 0.25),
    height: moderateScale(18, 0.25),
    backgroundColor: '#e6e6e6',
    borderRadius: 2,
  },
  tickTop: {
    top: moderateScale(12, 0.25),
    alignSelf: 'center',
  },
  tickRight: {
    right: moderateScale(12, 0.25),
    top: '50%',
    transform: [{ translateY: -9 }, { rotate: '90deg' }],
  },
  tickBottom: {
    bottom: moderateScale(12, 0.25),
    alignSelf: 'center',
  },
  tickLeft: {
    left: moderateScale(12, 0.25),
    top: '50%',
    transform: [{ translateY: -9 }, { rotate: '90deg' }],
  },
  arrowStaticWrapper: {
    position: 'absolute',
    width: moderateScale(300, 0.25),
    height: moderateScale(300, 0.25),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  arrowHeadUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2e7d32',
    marginBottom: -2,
  },
  arrowShaftUp: {
    width: 4,
    height: 36,
    backgroundColor: '#2e7d32',
    borderRadius: 2,
    marginTop: -4,
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
