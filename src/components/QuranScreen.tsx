import { Linking } from 'react-native';
const DONATE_URL = 'https://donate.stripe.com/test_6oUaEQ7Vx8AMb8s5gN1RC00';
// src/screens/Quran.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator, Platform, TextInput, Alert } from 'react-native';
import { Card } from 'react-native-elements';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Ayah {
  number: number;
  text: string;
  translation?: string;
  transliteration?: string;
  sajda?: boolean | { recommended: boolean; obligatory: boolean };
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
}

const QuranScreen: React.FC = () => {
  // Bookmarks: store as array of { surah: number, ayah?: number }
  const [bookmarks, setBookmarks] = useState<{ surah: number; ayah?: number }[]>([]);
  const [searchText, setSearchText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [quranSurahs, setQuranSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<string>('en.asad');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastConsoleError, setLastConsoleError] = useState<string | null>(null);
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  // New: toggle for translation vs transliteration per surah
  const [displayMode, setDisplayMode] = useState<'arabic' | 'translation' | 'transliteration'>('translation');

  useEffect(() => {
    fetchQuranText(selectedEdition);
  }, [selectedEdition]);

  // Load bookmarks from localStorage (AsyncStorage) if needed
  useEffect(() => {
    // Optionally implement persistent bookmarks
  }, []);

  const fetchQuranText = async (edition: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch Arabic, English, and Transliteration editions in parallel
      const [arabicRes, englishRes, translitRes] = await Promise.all([
        axios.get('https://api.alquran.cloud/v1/quran/quran-uthmani'),
        axios.get('https://api.alquran.cloud/v1/quran/en.asad'),
        axios.get('https://api.alquran.cloud/v1/quran/en.transliteration'),
      ]);
      // Merge ayahs by surah and ayah number
      const arabicSurahs = arabicRes.data.data.surahs;
      const englishSurahs = englishRes.data.data.surahs;
      const translitSurahs = translitRes.data.data.surahs;
      const mergedSurahs = arabicSurahs.map((arabicSurah: any, idx: number) => {
        const englishSurah = englishSurahs[idx];
        const translitSurah = translitSurahs[idx];
      const mergedAyahs = arabicSurah.ayahs.map((ayah: any, i: number) => ({
        ...ayah,
        translation: englishSurah.ayahs[i]?.text || '',
        transliteration: translitSurah.ayahs[i]?.text || '',
        sajda: ayah.sajda,
      }));
        return {
          ...arabicSurah,
          englishName: englishSurah.englishName,
          englishNameTranslation: englishSurah.englishNameTranslation,
          ayahs: mergedAyahs,
        };
      });
      setQuranSurahs(mergedSurahs);
    } catch (error: any) {
      let errorMsg = 'Failed to load Quran text. Please try again.';
      if (error?.response?.data?.message) {
        errorMsg += '\nAPI: ' + error.response.data.message;
      } else if (error?.message) {
        errorMsg += '\nError: ' + error.message;
      }
      setError(errorMsg);
      setLastConsoleError(error?.stack || JSON.stringify(error));
      console.error('QuranScreen error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurahPress = (surahNumber: number) => {
    setSelectedSurah(surahNumber);
  };

  const handleEditionChange = (edition: string) => {
    setSelectedEdition(edition);
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <LinearGradient
      colors={["#ffffffCC", "#eaf6fbCC"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardContainer}
    >
      <TouchableOpacity
        onPress={() => handleSurahPress(item.number)}
        activeOpacity={0.85}
        onLongPress={() => {
          // Bookmark surah
          setBookmarks((prev) => [...prev, { surah: item.number }]);
          Alert.alert('Bookmarked', `Surah ${item.englishName} bookmarked!`);
        }}
        style={{ width: '100%' }}
      >
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>
          <Text
            style={[ 
              {
                fontSize: fontSize,
                color: (typeof global !== 'undefined' && global.__nightMode) ? '#ffd700' : '#111',
                fontWeight: 'bold',
                textAlign: 'right',
                writingDirection: 'rtl',
                marginBottom: 14,
                paddingHorizontal: 8,
                fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'sans-serif',
                lineHeight: 44,
                backgroundColor: 'transparent',
                flex: 1,
              },
            ]}
          >
            {item.name}
          </Text>
          <Text style={{ color: '#888', fontSize: 18, marginRight: 4, marginLeft: 8, marginBottom: 14 }}>({item.number})</Text>
        </View>
        <View style={styles.dividerDecor} />
        <Text style={styles.cardText}>{item.englishNameTranslation}</Text>
        {/* Bookmark indicator with remove option */}
        {bookmarks.some(b => b.surah === item.number && !b.ayah) && (
          <TouchableOpacity
            onPress={() => {
              setBookmarks(prev => prev.filter(b => !(b.surah === item.number && !b.ayah)));
              Alert.alert('Bookmark Removed', `Surah ${item.englishName} unbookmarked.`);
            }}
          >
            <Text style={{ color: '#e67e22', fontSize: 14, marginTop: 2, textDecorationLine: 'underline' }}>★ Bookmarked (Tap to remove)</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {/* Next button removed as per user request */}
    </LinearGradient>
  );

  const renderAyahs = () => {
    if (!quranSurahs[selectedSurah! - 1]) return null;
    const surah = quranSurahs[selectedSurah! - 1];
    // Filter ayahs by search
    const filteredAyahs = searchText.trim()
      ? surah.ayahs.filter(
          (a) =>
            a.text.includes(searchText) ||
            (a.translation && a.translation.toLowerCase().includes(searchText.toLowerCase()))
        )
      : surah.ayahs;
    return (
      <LinearGradient
        colors={["#ffffffCC", "#eaf6fbCC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ayahCardContainer}
      >
        <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Surah navigation */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedSurah((prev) => (prev && prev > 1 ? prev - 1 : prev))}
              disabled={selectedSurah === 1}
              style={{ opacity: selectedSurah === 1 ? 0.5 : 1, padding: 6 }}
            >
              <Text style={{ fontSize: 18, color: '#3498db' }}>{'← Previous'}</Text>
            </TouchableOpacity>
            {/* Surah name and number, fully right-aligned and visible */}
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 0 }}>
              <Text style={{ color: '#888', fontSize: 18, marginLeft: 8 }}>({surah.number})</Text>
              <Text
                style={[
                  {
                    fontSize: fontSize,
                    color: (typeof global !== 'undefined' && global.__nightMode) ? '#ffd700' : '#111',
                    fontWeight: 'bold',
                    textAlign: 'right',
                    writingDirection: 'rtl',
                    marginBottom: 0,
                    paddingHorizontal: 8,
                    fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'sans-serif',
                    lineHeight: 44,
                    backgroundColor: 'transparent',
                    maxWidth: '90%',
                  },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {surah.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedSurah((prev) => (prev && prev < quranSurahs.length ? prev + 1 : prev))}
              disabled={selectedSurah === quranSurahs.length}
              style={{ opacity: selectedSurah === quranSurahs.length ? 0.5 : 1, padding: 6 }}
            >
              <Text style={{ fontSize: 18, color: '#3498db' }}>{'Next →'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardTitle}>({surah.englishName})</Text>
          <View style={styles.dividerDecor} />
          {/* Toggle translation/transliteration button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={() => setDisplayMode('arabic')}
              style={{ backgroundColor: displayMode === 'arabic' ? '#00515f' : '#eaf6fb', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, marginRight: 6 }}
            >
              <Text style={{ color: displayMode === 'arabic' ? '#fff' : '#00515f', fontWeight: 'bold', fontSize: 14 }}>Arabic</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDisplayMode('translation')}
              style={{ backgroundColor: displayMode === 'translation' ? '#00515f' : '#eaf6fb', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, marginRight: 6 }}
            >
              <Text style={{ color: displayMode === 'translation' ? '#fff' : '#00515f', fontWeight: 'bold', fontSize: 14 }}>Translation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDisplayMode('transliteration')}
              style={{ backgroundColor: displayMode === 'transliteration' ? '#00515f' : '#eaf6fb', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, marginRight: 10 }}
            >
              <Text style={{ color: displayMode === 'transliteration' ? '#fff' : '#00515f', fontWeight: 'bold', fontSize: 14 }}>Transliteration</Text>
            </TouchableOpacity>
          </View>
          {/* Font size controls and search */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setFontSize((f) => Math.max(18, f - 2))} style={{ marginHorizontal: 6 }}>
                <Text style={{ fontSize: 22, color: '#00515f' }}>A-</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFontSize((f) => Math.min(48, f + 2))} style={{ marginHorizontal: 6 }}>
                <Text style={{ fontSize: 26, color: '#00515f' }}>A+</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 4, minWidth: 120, fontSize: 15 }}
              placeholder={displayMode === 'translation' ? 'Search ayah or translation' : 'Search ayah or roman'}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          {filteredAyahs.map((ayah) => (
            <TouchableOpacity
              key={ayah.number}
              activeOpacity={0.7}
              style={[styles.ayahItemWrap, highlightedAyah === ayah.number && styles.ayahHighlight]}
              onPress={() => {
                setHighlightedAyah(ayah.number);
                setTimeout(() => setHighlightedAyah(null), 500);
              }}
              onLongPress={() => {
                setBookmarks((prev) => [...prev, { surah: surah.number, ayah: ayah.number }]);
                Alert.alert('Bookmarked', `Ayah ${ayah.number} of Surah ${surah.englishName} bookmarked!`);
              }}
            >
              <Text
                style={[
                  {
                    fontSize: fontSize,
                    color: (typeof global !== 'undefined' && global.__nightMode) ? '#ffd700' : '#111',
                    fontWeight: 'bold',
                    textAlign: 'right',
                    writingDirection: 'rtl',
                    marginBottom: 14,
                    paddingHorizontal: 8,
                    fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'sans-serif',
                    lineHeight: 44,
                    backgroundColor: 'transparent',
                  },
                  highlightedAyah === ayah.number && styles.ayahHighlight,
                ]}
              >
                {ayah.text} <Text style={{ color: '#888', fontSize: fontSize - 8 }}>
                  ({ayah.number})
                  {ayah.sajda && (
                    <Text style={{ color: '#e67e22', fontSize: fontSize - 10, marginLeft: 4 }}> ���7</Text>
                  )}
                </Text>
              </Text>
              {displayMode === 'translation' && ayah.translation && (
                <Text style={[styles.ayahTranslation, { fontSize: fontSize - 10 }]}>{ayah.translation}</Text>
              )}
              {displayMode === 'transliteration' && ayah.transliteration && (
                <Text style={[styles.ayahTranslation, { fontSize: fontSize - 10 }]}>{ayah.transliteration}</Text>
              )}
              {/* Only show translation or transliteration if not in arabic mode */}
              {/* Bookmark indicator with remove option */}
              {bookmarks.some(b => b.surah === surah.number && b.ayah === ayah.number) && (
                <TouchableOpacity
                  onPress={() => {
                    setBookmarks(prev => prev.filter(b => !(b.surah === surah.number && b.ayah === ayah.number)));
                    Alert.alert('Bookmark Removed', `Ayah ${ayah.number} of Surah ${surah.englishName} unbookmarked.`);
                  }}
                >
                  <Text style={{ color: '#e67e22', fontSize: 14, marginTop: 2, textDecorationLine: 'underline' }}>★ Bookmarked (Tap to remove)</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    );
  };

  const handleSwipeLeft = () => {
    setSelectedSurah(null);
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#eaf6fb", "#368a95"]}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ActivityIndicator size="large" color="#00515f" />
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={["#f8fafcAA", "#e0c3fcAA", "#a1c4fdAA", "#c2e9fbAA"]}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {lastConsoleError && (
            <View style={{ marginTop: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 8 }}>
              <Text style={{ color: '#e74c3c', fontSize: 13, fontFamily: 'monospace' }}>
                Console Error:\n{lastConsoleError}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchQuranText(selectedEdition)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#eaf6fb", "#ffffff", "#368a95"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBg}
    >
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>  
        <Image source={require('../Assets/QuranWallpaper.jpeg')} style={styles.quranImage} />
        {/* Credit text below Quran image */}
        <Text style={styles.creditText}>Quran text and translations provided by AlQuran Cloud</Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 0, marginBottom: 2, paddingVertical: 1, paddingHorizontal: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.10)' }}
          onPress={() => {
            Linking.openURL(DONATE_URL);
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 11, color: '#b88c4a', marginRight: 3, fontWeight: '400' }}>Donate</Text>
          <Text style={{ fontSize: 12, color: '#eabf7b', marginRight: 1 }}>us to keep going</Text>
          <Text style={{ fontSize: 12, color: '#e67e22', marginLeft: 2 }}>♥</Text>
        </TouchableOpacity>
        {!selectedSurah ? (
          <>
            <FlatList
              data={quranSurahs}
              keyExtractor={(item) => item.number.toString()}
              renderItem={renderSurahItem}
              contentContainerStyle={styles.listContainer}
            />
            <View style={styles.editionButtonsWrap}>
              <BlurView intensity={40} tint="light" style={styles.editionButtons}>
                <TouchableOpacity
                  style={[
                    styles.editionButton,
                    { backgroundColor: selectedEdition === 'en.asad' ? '#3498db' : 'rgba(255,255,255,0.2)' },
                  ]}
                  onPress={() => handleEditionChange('en.asad')}
                >
                  <Text style={[styles.editionButtonText, selectedEdition === 'en.asad' && { color: '#fff' }]}>Quran English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.editionButton,
                    { backgroundColor: selectedEdition === 'quran-uthmani' ? '#3498db' : 'rgba(255,255,255,0.2)' },
                  ]}
                  onPress={() => handleEditionChange('quran-uthmani')}
                >
                  <Text style={[styles.editionButtonText, selectedEdition === 'quran-uthmani' && { color: '#fff' }]}>Quran Arabic</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          </>
        ) : (
          renderAyahs()
        )}
        {selectedSurah !== null && (
          <BlurView intensity={40} tint="light" style={styles.backButtonWrap}>
            <TouchableOpacity style={styles.backButton} onPress={handleSwipeLeft}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </BlurView>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  creditText: {
    fontSize: 12,
    color: 'rgba(44,62,80,0.55)',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(86, 167, 117, 0.76)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3498db',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 20,
    borderRadius: 16,
    margin: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  quranImage: {
    width: '100%',
    height: 80, // reduced from 150
    resizeMode: 'cover',
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 8,
    opacity: 0.75,
    borderWidth: 2,
    borderColor: '#eaf6fb',
    shadowColor: '#368a95',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  listContainer: {
    paddingBottom: 30,
    paddingHorizontal: 6,
  },
  cardContainer: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    marginVertical: 6,
    marginHorizontal: 8,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  ayahCardContainer: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    margin: 6,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    minHeight: 400,
    width: '98%',
    flex: 1,
  },
  cardTitle: {
    textAlign: 'center',
    color: '#00515f',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
    marginBottom: 2,
  },
  ayahText: {
    textAlign: 'left',
    fontSize: 22,
    color: '#00515f',
    lineHeight: 34,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 12,
    fontWeight: '500',
  },
  ayahTranslation: {
    textAlign: 'left',
    fontSize: 18,
    color: '#2c3e50',
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: 'rgba(247,232,164,0.08)',
    borderRadius: 8,
    padding: 12,
    fontWeight: '400',
  },
  ayahHighlight: {
    backgroundColor: 'rgba(52,152,219,0.18)',
    borderColor: '#368a95',
    borderWidth: 1,
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
  },
  backButtonWrap: {
    position: 'absolute',
    top: 30,
    left: 18,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  backButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: 'rgba(52,152,219,0.85)',
    borderRadius: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  editionButtonsWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  editionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  editionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  editionButtonText: {
    color: '#3498db',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dividerDecor: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 1,
  },
  ayahItemWrap: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(234,246,251,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(52,152,219,0.08)',
  },
});

export default QuranScreen;
