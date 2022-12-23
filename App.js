import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Touchable, TouchableOpacity, Alert } from 'react-native';
import { IconButton } from '@react-native-material/core';
import Icon from "@expo/vector-icons/Feather";

export default function App() {
  const [times, setTimes] = useState([
    { time: "12:00", event: " " },
    { time: "1:00", event: " " },
    { time: "2:00", event: " " },
    { time: "3:00", event: " " },
    { time: "4:00", event: " " },
    { time: "5:00", event: " " },
    { time: "6:00", event: " " },
    { time: "7:00", event: " " },
    { time: "8:00", event: " " },
    { time: "9:00", event: " " },
    { time: "10:00", event: " " },
    { time: "11:00", event: " " },
  ]);

  function deleteEvents() {
    return Alert.alert("Delete all events?", "You cannot undo this action.", [
      { text: "Yes", onPress: () => console.log("Delete") },
      { text: "No", onPress: () => console.log("Don't Delete") },
    ]);
  }

  function addEvent(time) {
    const newTimes = times.map((item) => {
      if (item.time === time) {
        return { time: item.time, event: "Event" };
      } else {
        return { time: item.time, event: item.event };
      }
    });
    setTimes(newTimes);
    console.log("add event " + time);
  }

  return (
    <SafeAreaView style={[styles.mainContainer, colors.darkGrey]}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>OneDay</Text>
        <IconButton icon={props => <Icon name="plus" size={24} color="white" />} style={[styles.addIcon, colors.green]} />
        <IconButton icon={props => <Icon name="trash-2" size={20} color="white" />} style={[styles.deleteIcon, colors.red]} onPress={deleteEvents} />
      </View>

      <ScrollView>
        {times.map((item, i) => {
          return (
            <View key={i}>
              <TouchableOpacity onPress={() => addEvent(item.time)} style={styles.slotContainer} key={item.time}>
                <Text style={styles.timeSlotText}>{item.time}</Text>
              </TouchableOpacity>
              <View style={styles.emptyEventContainer} key={item + " event"}>
                <Text style={styles.timeSlotText}>{item.event}</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const colors = StyleSheet.create({
  darkGrey: { backgroundColor: "#212121" },
  grey: { backgroundColor: '#4f4f4f' },
  green: { backgroundColor: "#47b356" },
  red: { backgroundColor: "#e85b51" },
  white: { backgroundColor: "#fff" },
});

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  slotContainer: {
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    width: "25%",
    backgroundColor: '#4f4f4f',
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 20,
    marginTop: 5,
    marginLeft: 5,
    padding: 25,
  },
  emptyEventContainer: {
    paddingHorizontal: 10,
    position: "absolute",
    alignSelf: "flex-start",
    width: "70%",
    backgroundColor: '#4f4f4f',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 5,
    marginLeft: "28%",
    padding: 25,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeSlotText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  addIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    alignSelf: "flex-end",
    right: 20,
  },
  deleteIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    alignSelf: "flex-start",
    left: 20,
  },
});
