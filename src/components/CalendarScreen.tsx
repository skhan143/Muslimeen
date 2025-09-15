import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { AntDesign } from '@expo/vector-icons';

const dailyRoutine = [
  { time: "6:30 AM", task: "Wake up & Fajr prayer" },
  { time: "7:00 AM", task: "Prepare breakfast for kids" },
  { time: "7:30 AM", task: "Kids get ready for school" },
  { time: "8:00 AM", task: "School drop-off" },
  { time: "9:00 AM", task: "House chores / Groceries" },
  { time: "12:00 PM", task: "Dhuhr prayer & Lunch" },
  { time: "1:00 PM", task: "Kids homework / Reading" },
  { time: "3:00 PM", task: "School pick-up" },
  { time: "4:00 PM", task: "Snack & Playtime" },
  { time: "5:00 PM", task: "Asr prayer & Family time" },
  { time: "6:00 PM", task: "Prepare dinner" },
  { time: "7:00 PM", task: "Dinner with family" },
  { time: "8:00 PM", task: "Maghrib prayer & Story time" },
  { time: "9:00 PM", task: "Kids bedtime routine" },
  { time: "9:30 PM", task: "Isha prayer & Mom's relaxation" },
];

const styles = StyleSheet.create({
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  addButtonInline: {
    marginLeft: 8,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ee5253',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    shadowColor: '#ee5253',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 24,
    paddingBottom: 90,
    backgroundColor: "#eaf6fb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00515f",
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 24,
  },
  routineItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#368a95",
    width: 90,
  },
  task: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  addButton: {
    marginTop: 24,
    backgroundColor: "#368a95",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  completedItem: {
    backgroundColor: '#e6fbe6',
    opacity: 0.7,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  addTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  timeInput: {
    maxWidth: 110,
    marginRight: 8,
    textAlign: 'center',
  },
});

function CalendarScreen() {
  const [routine, setRoutine] = useState(dailyRoutine);
  const [completed, setCompleted] = useState(Array(dailyRoutine.length).fill(false));
  const [customTask, setCustomTask] = useState("");
  const [customTime, setCustomTime] = useState("");

  const handleAddTask = () => {
    if (!customTime.trim() || !customTask.trim()) {
      Alert.alert('Missing Info', 'Please enter both time and task.');
      return;
    }
    setRoutine([...routine, { time: customTime.trim(), task: customTask.trim() }]);
    setCompleted([...completed, false]);
    setCustomTask("");
    setCustomTime("");
  };

  const handleDeleteTask = (idx) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
            setRoutine((prev) => prev.filter((_, i) => i !== idx));
            setCompleted((prev) => prev.filter((_, i) => i !== idx));
          }
        },
      ]
    );
  };

  const handleToggle = (idx) => {
    setCompleted((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
      <Text style={styles.title}>Family Routine</Text>
      <Text style={styles.subtitle}>Simple daily scheduler for your family</Text>
      {routine.map((item, idx) => (
        <View key={idx} style={{ flex: 1, width: '100%' }}>
          <View style={[styles.routineItem, completed[idx] && styles.completedItem]}>
            <TouchableOpacity
              onPress={() => handleToggle(idx)}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <AntDesign
                name={completed[idx] ? "checkcircle" : "checkcircleo"}
                size={24}
                color={completed[idx] ? "#1bc700" : "#bbb"}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.time, completed[idx] && styles.completedText]}>{item.time}</Text>
              <Text style={[styles.task, completed[idx] && styles.completedText]}>{item.task}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTask(idx)}>
              <AntDesign name="delete" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={styles.addTaskRow}>
        <View style={styles.inputWithButton}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="Time (e.g. 10:00 AM)"
            value={customTime}
            onChangeText={setCustomTime}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Add a task..."
            value={customTask}
            onChangeText={setCustomTask}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButtonInline} onPress={handleAddTask}>
            <AntDesign name="pluscircle" size={28} color="#368a95" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default CalendarScreen;