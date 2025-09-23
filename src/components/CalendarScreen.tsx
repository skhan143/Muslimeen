import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  note: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default function CalendarScreenPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.note}>The Family Routine screen has been moved to <Text style={{fontWeight:'600'}}>src/experimental/</Text> for v2 development.</Text>
    </View>
  );
}