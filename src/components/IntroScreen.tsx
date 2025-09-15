import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

// Enhanced: Smoother animation, better accessibility, and visual polish
const TYPING_SPEED = 55;
const ERASING_SPEED = 1;
const MESSAGES = [
  "Qalby Muslim",
  "Prayer, Qibla, Quran & More"
];

const getBlockCursor = (color = "#18181c", fontSize = 36) => (
  <Text
    style={[
      styles.blockCursor,
      { color, fontSize, lineHeight: fontSize }
    ]}
    accessibilityLabel="typing cursor"
    accessible={false}
  >
    ●
  </Text>
);

// ChatGPT-style: Only one message visible at a time, type+erase, auto-navigate, no continue button
const IntroScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayed, setCurrentDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const [phase, setPhase] = useState<'typing' | 'erasing' | 'done'>('typing');

  useEffect(() => {
    let idx = 0;
    let typingTimeout: NodeJS.Timeout;
    let erasingTimeout: NodeJS.Timeout;
    function typeNextChar() {
      if (idx < MESSAGES[currentMessage].length) {
        setCurrentDisplayed(MESSAGES[currentMessage].slice(0, idx + 1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        idx++;
        typingTimeout = setTimeout(typeNextChar, TYPING_SPEED);
      } else {
        setTimeout(() => setPhase('erasing'), 400);
      }
    }
    function erasePrevChar() {
      if (idx > 0) {
        setCurrentDisplayed(MESSAGES[currentMessage].slice(0, idx - 1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        idx--;
        erasingTimeout = setTimeout(erasePrevChar, ERASING_SPEED);
      } else {
        if (currentMessage < MESSAGES.length - 1) {
          setTimeout(() => {
            setCurrentMessage((m) => m + 1);
            setPhase('typing');
          }, 200);
        } else {
          setTyping(false);
          setPhase('done');
          setTimeout(() => onFinish(), 700);
        }
      }
    }
    if (typing) {
      if (phase === 'typing') {
        setCurrentDisplayed("");
        idx = 0;
        typeNextChar();
      } else if (phase === 'erasing') {
        idx = MESSAGES[currentMessage].length;
        erasePrevChar();
      }
    }
    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(erasingTimeout);
    };
  }, [currentMessage, phase, typing]);

  return (
    <LinearGradient
      colors={["#eaf6fb", "#ffffff", "#368a95"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBg}
    >
      <View style={styles.centeredContent}>
        {/* Enhanced heart + crescent logo */}
        <Svg height="70" width="70" viewBox="0 0 70 70" style={{ marginBottom: 18 }}>
          {/* Soft shadow */}
          <Path
            d="M35 60 C13 42, 10 25, 27 17 C33 14, 35 22, 35 22 C35 22, 37 14, 43 17 C60 25, 57 42, 35 60 Z"
            fill="#000"
            opacity="0.08"
          />
          {/* Heart shape with gold outline */}
          <Path
            d="M35 58 C15 40, 10 25, 25 18 C32 15, 35 22, 35 22 C35 22, 38 15, 45 18 C60 25, 55 40, 35 58 Z"
            fill="#368a95"
            stroke="#f7e8a4"
            strokeWidth="2.5"
          />
          {/* Crescent moon with soft gold */}
          <Path
            d="M47 22 A12 12 0 1 1 33 22 A8 8 0 1 0 47 22 Z"
            fill="#f7e8a4"
            opacity="0.95"
          />
        </Svg>
        <Text
          style={styles.extraLargeText}
          accessibilityRole="header"
          accessibilityLabel={displayed}
          accessible
        >
          {displayed}
          {(typing && (phase === 'typing' || phase === 'erasing')) ? getBlockCursor(undefined, styles.extraLargeText.fontSize) : null}
        </Text>
        <Text style={styles.footer} accessibilityRole="text">
          <Text style={styles.footerBrand}>Qalby Muslim</Text>
          {"\n"}
          <Text style={styles.footerBy}>By shahariyar Khan</Text>
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  extraLargeText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#18181c",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 10,
    minHeight: 44,
    maxWidth: '90%',
  },
  blockCursor: {
    fontWeight: "bold",
    fontSize: 36,
    marginLeft: 2,
    marginRight: 0,
    lineHeight: 36,
    color: "#18181c",
    verticalAlign: 'middle',
  },
  footer: {
    fontSize: 16,
    color: "#368a95",
    position: "absolute",
    bottom: 32,
    textAlign: "center",
    width: "100%",
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  footerBrand: {
    color: "#368a95",
    fontWeight: "bold",
    letterSpacing: 1.5,
    fontSize: 18,
  },
  footerBy: {
    color: "#368a95",
    fontWeight: "600",
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
    letterSpacing: 1.1,
  },
});

export default IntroScreen;
