// src/screens/Quran.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
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

  useEffect(() => {
    // Fetch Quran text (example edition: en.asad for Muhammad Asad's translation)
    fetchQuranText(selectedEdition);
  }, [selectedEdition]);

  const fetchQuranText = async (edition: string) => {
    try {
      const response = await axios.get(`https://api.alquran.cloud/v1/quran/${edition}`);
      setQuranSurahs(response.data.data.surahs);
    } catch (error) {
      console.error('Error fetching Quran text:', error);
    }
  };

  const fetchPage = async (page: number, edition: string) => {
    try {
      const response = await axios.get(`http://api.alquran.cloud/v1/page/${page}/${edition}`);
      setQuranSurahs(response.data.data.surahs);
    } catch (error) {
      console.error('Error fetching Quran text:', error);
    }
  };

  const handleSurahPress = (surahNumber: number) => {
    // Handle surah click, you can navigate to a detailed view or perform any other action
    setSelectedSurah(surahNumber);
  };

  const handleEditionChange = (edition: string) => {
    // Handle edition change
    setSelectedEdition(edition);
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity onPress={() => handleSurahPress(item.number)}>
      <Card containerStyle={styles.cardContainer}>
        <Card.Title h4 style={styles.cardTitle}>{item.name}</Card.Title>
        <Card.Divider />
        <Text style={styles.cardText}>{item.englishNameTranslation}</Text>
      </Card>
    </TouchableOpacity>
  );

  const renderAyahs = () => (
    <Card containerStyle={styles.cardContainer}>
      <ScrollView style={styles.scrollView}>
        <Card.Title h4 style={styles.cardTitle}>{quranSurahs[selectedSurah! - 1]?.name}</Card.Title>
        <Card.Divider />
        {quranSurahs[selectedSurah! - 1]?.ayahs.map((ayah) => (
          <Text key={ayah.number} style={styles.cardText}>{ayah.text}</Text>
        ))}
      </ScrollView>
    </Card>
  );

  const handleSwipeLeft = () => {
    // Swipe left to exit from the detailed view
    setSelectedSurah(null);
  };

  return (
    <View style={styles.container}>
      <Image source={require('https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Fquran%2F&psig=AOvVaw3NWLW7syWiUuhr9_7QbgKH&ust=1711175655955000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCMjImpugh4UDFQAAAAAdAAAAABAE')} style={styles.quranImage} />

      {!selectedSurah ? (
        <>
          <FlatList
            data={quranSurahs}
            keyExtractor={(item) => item.number.toString()}
            renderItem={renderSurahItem}
          />

          {/* Add buttons to switch between editions */}
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
  quranImage: {
    width: '100%',
    height: 200, // Adjust the height as needed
    resizeMode: 'cover',
  },
  cardContainer: {
      backgroundColor: '#ffffff',
      margin: 10,
      alignItems: 'center',
      padding: 15, 
  },
  cardTitle: {
    textAlign: 'center',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 25, 
    textDecorationLine: 'underline',
    textDecorationColor: '#d3d3d3',
  },
  scrollView: {
    maxHeight: '90%', // Adjust the max height as needed
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#ffffff',
  },
  editionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  editionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  editionButtonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default QuranScreen;
