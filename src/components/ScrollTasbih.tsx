import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Platform, TouchableOpacity, Animated, PanResponder, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TASBIH_LIST = [
  {
    arabic: 'سُبْحَانَ اللّٰهِ',
    transliteration: 'Subhanallah',
    translation: 'Glory be to Allah',
    count: 33,
  },
  {
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    count: 33,
  },
  {
    arabic: 'اللّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    count: 34,
  },
  {
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    count: 100,
  },
  {
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no god but Allah',
    count: 100,
  },
  {
    arabic: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ',
    transliteration: 'Subhanallahi wa bihamdihi',
    translation: 'Glory and praise be to Allah',
    count: 100,
  },
  {
    arabic: 'سُبْحَانَ اللّٰهِ الْعَظِيمِ',
    transliteration: 'Subhanallahil Azim',
    translation: 'Glory be to Allah, the Magnificent',
    count: 100,
  },
  {
    arabic: 'اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allahumma salli ala Muhammad',
    translation: 'O Allah, send blessings upon Muhammad',
    count: 10,
  },
  {
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    translation: 'There is no power nor might except with Allah',
    count: 10,
  },
  {
    arabic: 'رَبِّ اغْفِرْ لِي وَارْحَمْنِي',
    transliteration: 'Rabbi ighfir li warhamni',
    translation: 'My Lord, forgive me and have mercy on me',
    count: 10,
  },
  {
    arabic: 'اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
    transliteration: 'Allahumma inni a’udhu bika minal-hammi wal-hazan',
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow',
    count: 3,
  },
  {
    arabic: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ',
    transliteration: 'Allahumma inni as’aluka al-‘afwa wal-‘afiyah',
    translation: 'O Allah, I ask You for pardon and well-being',
    count: 3,
  },
  {
    arabic: 'اللّٰهُمَّ أَجِرْنِي مِنَ النَّارِ',
    transliteration: 'Allahumma ajirni minan-nar',
    translation: 'O Allah, protect me from the Fire',
    count: 7,
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni ilma',
    translation: 'My Lord, increase me in knowledge',
    count: 3,
  },
  {
    arabic: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ',
    transliteration: 'Allahumma inni as’aluka al-jannah',
    translation: 'O Allah, I ask You for Paradise',
    count: 3,
  },
  {
    arabic: 'اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ سُوءِ الْخُلُقِ',
    transliteration: 'Allahumma inni a’udhu bika min su’il khuluq',
    translation: 'O Allah, I seek refuge in You from bad character',
    count: 3,
  },
  {
    arabic: 'لَا إِلٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa anta subhanaka inni kuntu minaz zalimin',
    translation: 'There is no deity except You; glory be to You, indeed I have been of the wrongdoers. (Quran 21:87, Ayat E Kareema)',
    count: 7,
  },
  {
    arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    transliteration: 'Rabbi inni lima anzalta ilayya min khairin faqir',
    translation: 'My Lord, indeed I am, for whatever good You would send down to me, in need. (Quran 28:24)',
    count: 7,
  },
];

const { height, width } = Dimensions.get('window');

const CARD_MARGIN = 0;
const CARD_HEIGHT = height;
const CARD_WIDTH = width;

const TYPE_SPEED = 32;

const TypewriterText = ({ text, style, onDone }: { text: string; style?: any; onDone?: () => void }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let idx = 0;
    let timeout: NodeJS.Timeout;
    function typeNext() {
      if (idx <= text.length) {
        setDisplayed(text.slice(0, idx));
        idx++;
        timeout = setTimeout(typeNext, TYPE_SPEED);
      } else if (onDone) {
        onDone();
      }
    }
    setDisplayed('');
    typeNext();
    return () => clearTimeout(timeout);
  }, [text]);
  return <Text style={style}>{displayed}</Text>;
};

const ScrollTasbih: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const [counters, setCounters] = useState(TASBIH_LIST.map(() => 0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rippleAnim] = useState(() => new Animated.Value(0));
  const [swipeAnim] = useState(() => new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [showSwipeUpHint, setShowSwipeUpHint] = useState(false);
  const [swipeUpHintCount, setSwipeUpHintCount] = useState(0);
  const swipeUpAnim = useRef(new Animated.Value(0)).current;

  // Animate ripple on tap
  const triggerRipple = () => {
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  // Animate swipe overlay
  const triggerSwipe = () => {
    swipeAnim.setValue(0);
    Animated.timing(swipeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => swipeAnim.setValue(0));
  };

  const handleIncrement = (idx: number) => {
    if (counters[idx] < TASBIH_LIST[idx].count) {
      const newCounters = [...counters];
      newCounters[idx] += 1;
      setCounters(newCounters);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      triggerRipple();
      if (newCounters[idx] === TASBIH_LIST[idx].count) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);
      }
    }
  };

  const handleReset = (idx: number) => {
    const newCounters = [...counters];
    newCounters[idx] = 0;
    setCounters(newCounters);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // PanResponder for right swipe
  const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Detect horizontal or vertical swipe
      return (Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 40) || (gestureState.dy < -40);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 40) {
        handleIncrement(currentIndex);
        triggerSwipe();
        setShowSwipeHint(false);
      }
      // Detect swipe up
      if (gestureState.dy < -40) {
        triggerSwipeUpHint();
      }
    },
  })
).current;

const triggerSwipeUpHint = () => {
  setShowSwipeUpHint(true);
  Animated.sequence([
    Animated.timing(swipeUpAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.delay(900),
    Animated.timing(swipeUpAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    })
  ]).start(() => {
    setShowSwipeUpHint(false);
  });
};

// Show swipe up animation only once when first card is visible on initial mount
useEffect(() => {
  if (currentIndex === 0) {
    setShowSwipeUpHint(true);
    Animated.sequence([
      Animated.timing(swipeUpAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(700),
      Animated.timing(swipeUpAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSwipeUpHint(false);
    });
  }
  // Only run on initial mount and when currentIndex changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentIndex]);

  // Removed useEffect that triggered swipe up animation on every scroll to prevent console error. Swipe up animation now only triggers on swipe up gesture.

  return (
    <LinearGradient
      colors={["#eaf6fb", "#ffffff", "#368a95"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Title at the top */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 10, marginBottom: 2 }}>
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#00515f', letterSpacing: 0.2 }}>Tasbih Scroll</Text>
      </View>
      {/* Swipe Up Animation Hint */}
      {showSwipeUpHint && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 54,
            left: 0,
            right: 0,
            alignItems: 'center',
            opacity: swipeUpAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }),
            transform: [{ translateY: swipeUpAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            zIndex: 30,
          }}
          pointerEvents="none"
        >
          <MaterialCommunityIcons name="gesture-swipe-up" size={28} color="#368a95" style={{ opacity: 0.7 }} />
          <Text style={{ color: '#368a95', fontWeight: 'bold', fontSize: 13, marginTop: 1, opacity: 0.7 }}>Swipe up for more</Text>
        </Animated.View>
      )}
      {/* Go to Top Button */}
      {currentIndex > 2 && (
        <TouchableOpacity
          style={styles.goTopButton}
          onPress={() => {
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-up-bold-circle" size={38} color="#368a95" />
        </TouchableOpacity>
      )}
      <FlatList
        ref={flatListRef}
        data={TASBIH_LIST}
        keyExtractor={(_, idx) => idx.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate={0.98}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{}}
        renderItem={({ item, index }) => (
          <LinearGradient
            colors={["#ffffffCC", "#eaf6fbCC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tasbihCard, { height: CARD_HEIGHT, width: CARD_WIDTH, padding: 24 }]}
          >
            {/* Animated Ripple */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: '#eaf6fb99',
                opacity: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                transform: [
                  { scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2.5] }) },
                ],
                alignSelf: 'center',
                top: CARD_HEIGHT / 2 - 100,
                left: CARD_WIDTH / 2 - 100,
              }}
            />
            {/* Swipe Overlay */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                backgroundColor: '#368a95CC',
                opacity: swipeAnim,
                zIndex: 2,
              }}
            >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="gesture-swipe-right" size={64} color="#368a95" />
              </View>
            </Animated.View>
            {/* Confetti/Completed Animation */}
            {showConfetti && (
              <View style={styles.confettiWrap} pointerEvents="none">
                <MaterialCommunityIcons name="party-popper" size={80} color="#f1c40f" />
                <Text style={styles.completedText}>Completed!</Text>
              </View>
            )}
            {index === currentIndex ? (
              <>
                <Text style={[styles.arabic, item.arabic === 'لَا إِلٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ' && { fontSize: 28 }]}>{item.arabic}</Text>
                <TypewriterText
                  text={item.transliteration}
                  style={styles.transliteration}
                />
                <Text style={styles.translation}>{item.translation}</Text>
              </>
            ) : (
              <>
                <Text style={styles.arabic}>{item.arabic}</Text>
                <Text style={styles.transliteration}>{item.transliteration}</Text>
                <Text style={styles.translation}>{item.translation}</Text>
              </>
            )}
            <Text style={styles.count}>{counters[index]} / {item.count}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleIncrement(index)}
              activeOpacity={0.7}
              disabled={counters[index] >= item.count}
            >
              <Text style={styles.counterButtonText}>{counters[index] < item.count ? 'Tap to Count' : 'Completed!'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => handleReset(index)}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            {/* Swipe/Hint Animation */}
            {showSwipeHint && index === currentIndex && (
              <Animated.View style={[styles.swipeHint, {
                opacity: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }),
                transform: [{ translateX: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }) }],
              }]}>
                <MaterialCommunityIcons name="gesture-swipe-right" size={32} color="#368a95" />
                <Text style={styles.swipeHintText}>Swipe right or tap to count</Text>
              </Animated.View>
            )}
          </LinearGradient>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        snapToInterval={CARD_HEIGHT}
        disableIntervalMomentum={true}
      />
      <View style={styles.pageIndicatorWrap}>
        {TASBIH_LIST.map((_, idx) => (
          <View
            key={idx}
            style={[styles.pageDot, currentIndex === idx && styles.pageDotActive]}
          />
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  tasbihCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 24,
    borderRadius: 0,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  arabic: {
    fontSize: 44,
    color: '#00515f',
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'sans-serif',
  },
  transliteration: {
    fontSize: 22,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  translation: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 16,
    textAlign: 'center',
  },
  count: {
    fontSize: 20,
    color: '#2ecc71',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  counterButton: {
    backgroundColor: '#00515f',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 32,
    marginTop: 24,
    marginBottom: 10,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 24,
    marginTop: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pageIndicatorWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: -32,
  },
  pageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#b2ebf2',
    marginHorizontal: 6,
    opacity: 0.5,
  },
  pageDotActive: {
    backgroundColor: '#00515f',
    opacity: 1,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  confettiWrap: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  completedText: {
    fontSize: 28,
    color: '#f1c40f',
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 38,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7faee',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  swipeHintText: {
    color: '#00b894',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  goTopButton: {
    position: 'absolute',
    top: 38,
    right: 24,
    zIndex: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 4,
    elevation: 6,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
});

export default ScrollTasbih;
