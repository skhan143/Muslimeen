// src/screens/Quran.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-elements';
import axios from 'axios';

interface Ayah {
  number: number;
  text: string;
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
  const [quranSurahs, setQuranSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<string>('en.asad');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuranText(selectedEdition);
  }, [selectedEdition]);

  const fetchQuranText = async (edition: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`https://api.alquran.cloud/v1/quran/${edition}`);
      setQuranSurahs(response.data.data.surahs);
    } catch (error) {
      console.error('Error fetching Quran text:', error);
      setError('Failed to load Quran text. Please try again.');
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
    <TouchableOpacity onPress={() => handleSurahPress(item.number)}>
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.divider} />
        <Text style={styles.cardText}>{item.englishNameTranslation}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAyahs = () => {
    if (!quranSurahs[selectedSurah! - 1]) return null;

    return (
      <View style={styles.cardContainer}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.cardTitle}>{quranSurahs[selectedSurah! - 1]?.name}</Text>
          <View style={styles.divider} />
          {quranSurahs[selectedSurah! - 1]?.ayahs.map((ayah) => (
            <Text key={ayah.number} style={styles.cardText}>{ayah.text}</Text>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleSwipeLeft = () => {
    setSelectedSurah(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading Quran...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchQuranText(selectedEdition)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../Assets/QuranWallpaper.jpeg')} style={styles.quranImage} />
      {!selectedSurah ? (
        <>
          <FlatList
            data={quranSurahs}
            keyExtractor={(item) => item.number.toString()}
            renderItem={renderSurahItem}
            contentContainerStyle={styles.listContainer}
          />

          <View style={styles.editionButtons}>
            <TouchableOpacity
              style={[
                styles.editionButton,
                { backgroundColor: selectedEdition === 'en.asad' ? '#3498db' : '#e74c3c' },
              ]}
              onPress={() => handleEditionChange('en.asad')}
            >
              <Text style={styles.editionButtonText}>English (Asad)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.editionButton,
                { backgroundColor: selectedEdition === 'quran-uthmani' ? '#3498db' : '#e74c3c' },
              ]}
              onPress={() => handleEditionChange('quran-uthmani')}
            >
              <Text style={styles.editionButtonText}>Quran Arabic</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        renderAyahs()
      )}

      {selectedSurah !== null && (
        <TouchableOpacity style={styles.backButton} onPress={handleSwipeLeft}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#f0f0f0',
    padding: 20,
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
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  quranImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  listContainer: {
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    textAlign: 'center',
    color: '#2c3e50',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#2c3e50',
    lineHeight: 24,
  },
  scrollView: {
    maxHeight: '90%',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  editionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 10,
  },
  editionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editionButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
});

export default QuranScreen;
