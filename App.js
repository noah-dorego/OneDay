import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { IconButton } from '@react-native-material/core';
import Dialog from "react-native-dialog";
import SelectDropdown from 'react-native-select-dropdown'
import Icon from "@expo/vector-icons/Feather";

export default function App() {
  const [currentTime, setCurrentTime] = useState("12:00");
  const [eventTitle, setEventTitle] = useState(" ");

  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

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
      { text: "Yes", onPress: () => clearEvents() },
      { text: "No", onPress: () => console.log("Cancelled event deletion.") },
    ]);
  }

  function clearEvents() {
    const newTimes = times.map((item) => {
      return { time: item.time, event: " " };
    });
    setTimes(newTimes);
    console.log("Deleted events.");
  }

  function addEvent(time, newEvent) {
    setAddDialogVisible(false);
    const newTimes = times.map((item) => {
      if (item.time === time) {
        return { time: item.time, event: newEvent };
      } else {
        return { time: item.time, event: item.event };
      }
    });
    setTimes(newTimes);
    console.log("add event " + time);
  }

  function confirmAddEvent(time) {
    console.log("dialog");
    setCurrentTime(time);
    setAddDialogVisible(true);
  }

  function removeEvent(time) {
    setAddDialogVisible(false);
    const newTimes = times.map((item) => {
      if (item.time === time) {
        return { time: item.time, event: " " };
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
        <IconButton icon={props => <Icon name="plus" size={24} color="white" />} style={[styles.addIcon, colors.green]} onPress={() => setAddModalVisible(true)} />
        <IconButton icon={props => <Icon name="trash-2" size={20} color="white" />} style={[styles.deleteIcon, colors.red]} onPress={deleteEvents} />
      </View>

      <ScrollView>
        {times.map((item, i) => {
          return (
            <View key={i}>
              <TouchableOpacity onPressOut={() => confirmAddEvent(item.time)} style={styles.slotContainer} key={item.time}>
                <Text style={styles.timeSlotText}>{item.time}</Text>
              </TouchableOpacity>
              <View style={styles.emptyEventContainer} key={item + " event"}>
                <Text style={styles.timeSlotText} onLongPress={() => removeEvent(item.time)}>{item.event}</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <Dialog.Container visible={addDialogVisible}>
        <Dialog.Title>Add Event</Dialog.Title>
        <Dialog.Description>
          Enter your title below.
        </Dialog.Description>
        <Dialog.Input value={eventTitle} onChangeText={setEventTitle}></Dialog.Input>
        <Dialog.Button label="Add" onPress={() => addEvent(currentTime, eventTitle)} />
        <Dialog.Button label="Cancel" onPress={() => setAddDialogVisible(false)} />
      </Dialog.Container>

      <Modal
        animationType="fade"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={[styles.modalView, colors.white]}>
          <Text style={styles.modalTitleText}>Add Event</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Event Title"
            value={eventTitle}
            onChangeText={setEventTitle}
          />
          <SelectDropdown
            buttonStyle={styles.timeDropdown}
            buttonTextStyle={styles.whiteBodyText}
            defaultButtonText="Start Time"
            renderDropdownIcon={() => { return <Icon name="chevron-down" size={20} color="white" /> }}
            data={times}
            onSelect={(selectedItem, index) => {
              console.log(selectedItem, index)
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return "Start Time: " + selectedItem.time
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item.time
            }}
          />
          <SelectDropdown
            buttonStyle={styles.timeDropdown}
            buttonTextStyle={styles.whiteBodyText}
            defaultButtonText="End Time"
            renderDropdownIcon={() => { return <Icon name="chevron-down" size={20} color="white" /> }}
            data={times}
            onSelect={(selectedItem, index) => {
              console.log(selectedItem, index)
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return "End Time: " + selectedItem.time
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item.time
            }}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, colors.green]}
              onPress={() => setAddModalVisible(!addModalVisible)}
            >
              <Text style={[styles.buttonText, colors.whiteText]}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, colors.red]}
              onPress={() => setAddModalVisible(!addModalVisible)}
            >
              <Text style={[styles.buttonText, colors.whiteText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  whiteText: { color: "#fff" },
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
  modalView: {
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    marginTop: "50%",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    width: 100,
    height: 40,
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
    elevation: 2,
  },
  buttonContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 40,
  },
  textInput: {
    height: "auto",
    margin: 12,
    borderWidth: 1,
    padding: 18,
    borderRadius: 20,
    width: "90%",
  },
  timeDropdown: {
    margin: 12,
    borderRadius: 20,
    backgroundColor: "#4f4f4f",
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalTitleText: {
    fontSize: 24,
    margin: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  whiteBodyText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center"
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
