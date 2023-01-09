import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking, TextInput, Dimensions } from 'react-native';
import { IconButton, Switch } from '@react-native-material/core';
import ModalNew from "react-native-modal";
import Dialog from "react-native-dialog";
import SelectDropdown from 'react-native-select-dropdown'
import ColorPicker from 'react-native-wheel-color-picker'
import Icon from "@expo/vector-icons/Feather";

export default function App() {

  // Vars
  const EMPTY_EVENT_PLACEHOLDER = "     ";
  //const times = ["12:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00"];
  const deviceWidth = Dimensions.get("window").width;
  const deviceHeight =
    Platform.OS === "ios"
      ? Dimensions.get("window").height
      : require("react-native-extra-dimensions-android").get(
        "REAL_WINDOW_HEIGHT"
      );

  const linkedinURL = "https://www.linkedin.com/in/noah-do-rego/";
  const githubURL = "https://github.com/NoahdoRegoUO";

  var currentHour = new Date().getHours() % 12;
  var currentMin = new Date().getMinutes();

  // Custom event params
  const [currentTime, setCurrentTime] = useState("12:00");
  const [eventStartTime, setEventStartTime] = useState("12:00");
  const [eventTitle, setEventTitle] = useState(EMPTY_EVENT_PLACEHOLDER);
  const [eventColor, setEventColor] = useState('');

  // Modal/dialog params
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Settings params
  const [notifications, setNotifications] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  const [events, setEvents] = useState([
    { time: "12:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "1:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "2:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "3:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "4:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "5:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "6:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "7:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "8:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "9:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "10:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
    { time: "11:00", event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey },
  ]);

  const onColorChange = eventColor => {
    setEventColor(eventColor);
  };

  const deleteEvents = () => {
    return Alert.alert("Delete all events?", "You cannot undo this action.", [
      { text: "Yes", onPress: () => clearEvents() },
      { text: "No", onPress: () => console.log("Cancelled event deletion.") },
    ]);
  }

  const clearEvents = () => {
    const newEvents = events.map((item) => {
      return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey };
    });
    setEvents(newEvents);
    console.log("Deleted events.");
  }

  const addEvent = (time, newEvent) => {
    setAddDialogVisible(false);
    if (newEvent === "") {
      newEvent = " ";
    }
    const newEvents = events.map((item) => {
      if (item.time === time) {
        return { time: item.time, event: newEvent, color: colors.grey };
      } else {
        return { time: item.time, event: item.event, color: item.color };
      }
    });
    setEvents(newEvents);
    console.log("add event for" + time + " at time: " + currentHour + ":" + currentMin);
  }

  const addCustomEvent = (time, newEvent, customColor) => {
    setAddModalVisible(false);
    if (newEvent === "") {
      newEvent = " ";
    }
    const newEvents = events.map((item) => {
      if (item.time === time) {
        return { time: item.time, event: newEvent, color: { backgroundColor: customColor } };
      } else {
        return { time: item.time, event: item.event, color: item.color };
      }
    });
    setEvents(newEvents);
    console.log("add event " + time);
  }

  const confirmAddEvent = (time) => {
    console.log("dialog");
    setCurrentTime(time);
    setAddDialogVisible(true);
  }

  const removeEvent = (time) => {
    setAddDialogVisible(false);
    const newEvents = events.map((item) => {
      if (item.time === time) {
        return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: item.color };
      } else {
        return { time: item.time, event: item.event, color: item.color };
      }
    });
    setEvents(newEvents);
    console.log("remove event " + time);
  }

  const eventSelected = (time, event) => {
    if (event === EMPTY_EVENT_PLACEHOLDER || event === " ") {
      confirmAddEvent(time);
    } else {
      removeEvent(time);
    }
  }

  return (
    <SafeAreaView style={[styles.mainContainer, colors.darkGrey]}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>OneDay</Text>
        <IconButton icon={props => <Icon name="plus" size={24} color="white" />} style={[styles.addIcon, colors.green]} onPress={() => setAddModalVisible(true)} />
        <IconButton icon={props => <Icon name="trash-2" size={20} color="white" />} style={[styles.deleteIcon, colors.red]} onPress={deleteEvents} />
        <IconButton icon={props => <Icon name="settings" size={20} color="white" />} style={[styles.settingsIcon, colors.grey]} onPress={() => setSettingsModalVisible(true)} />
        <IconButton icon={props => <Icon name="menu" size={20} color="white" />} style={[styles.detailsIcon, colors.grey]} onPress={() => setDetailsModalVisible(true)} />
      </View>

      <ScrollView>
        {events.map((item, i) => {
          return (
            <View key={i}>
              <TouchableOpacity onLongPress={() => confirmAddEvent(item.time)} style={styles.slotContainer} key={item.time}>
                <Text style={styles.timeSlotText}>{item.time}</Text>
              </TouchableOpacity>
              <View style={[styles.emptyEventContainer, item.color]} key={item + " event"}>
                <Text style={styles.timeSlotText} onLongPress={() => eventSelected(item.time, item.event)}>{item.event}</Text>
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

      <ModalNew
        isVisible={addModalVisible}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
        style={styles.modalViewContainer}
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
            data={events}
            onSelect={(selectedItem, index) => {
              console.log(selectedItem);
              setEventStartTime(selectedItem.time);
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
            data={events}
            onSelect={(selectedItem, index) => {
              //setEventStartTime(selectedItem.time);
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
          <View style={styles.colorPicker}>
            <ColorPicker
              color={eventColor}
              onColorChange={(eventColor) => onColorChange(eventColor)}
              thumbSize={30}
              sliderSize={20}
              swatches={true}
              noSnap={true}
              row={false}
            />
          </View>
          <View style={[{ height: 200 }]} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, colors.green]}
              onPress={() => addCustomEvent(eventStartTime, eventTitle, eventColor)}
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
      </ModalNew>

      <ModalNew // *** Settings Modal ***
        isVisible={settingsModalVisible}
        onBackdropPress={() => setSettingsModalVisible(false)}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
        style={styles.modalViewContainer}
      >
        <View style={[styles.modalView, colors.white]}>
          <Text style={styles.modalTitleText}>Settings</Text>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingText}>Notifications</Text>
            <Switch
              style={styles.settingsSwitch}
              trackColor={{ false: colors.lightGrey, true: colors.green }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setNotifications}
              value={notifications}
            />
          </View>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingText}>Light Mode</Text>
            <Switch
              style={styles.settingsSwitch}
              trackColor={{ false: colors.lightGrey, true: colors.green }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setLightMode}
              value={lightMode}
            />
          </View>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingText}>Clock Type</Text>
            <View style={styles.buttonContainerSecondary}>
              <TouchableOpacity
                style={[styles.clock12HourButton, colors.green]}
                onPress={() => console.log("Set to 12 hour clock")}
              >
                <Text style={[styles.buttonText, colors.whiteText]}>12 Hour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.clock24HourButton, colors.green]}
                onPress={() => console.log("Set to 24 hour clock")}
              >
                <Text style={[styles.buttonText, colors.whiteText]}>24 Hour</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.extraSpace} />
          <SelectDropdown
            buttonStyle={styles.timeDropdown}
            buttonTextStyle={styles.whiteBodyText}
            defaultButtonText="Day Start Time"
            renderDropdownIcon={() => { return <Icon name="chevron-down" size={20} color="white" /> }}
            data={events}
            onSelect={(selectedItem, index) => {
              console.log(selectedItem);
              setEventStartTime(selectedItem.time);
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
            defaultButtonText="Day End Time"
            renderDropdownIcon={() => { return <Icon name="chevron-down" size={20} color="white" /> }}
            data={events}
            onSelect={(selectedItem, index) => {
              //setEventStartTime(selectedItem.time);
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
              style={[styles.modalButton, colors.grey]}
              onPress={() => setSettingsModalVisible(false)}
            >
              <Text style={[styles.buttonText, colors.whiteText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalNew>

      <ModalNew // *** Details Modal ***
        isVisible={detailsModalVisible}
        onBackdropPress={() => setDetailsModalVisible(false)}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
        style={styles.modalViewContainer}
      >
        <View style={[styles.modalView, colors.white]}>
          <Text style={styles.modalTitleText}>Details</Text>
          <Text style={styles.normalText}>
            OneDay is a simple scheduling app that can be used for planning your day, creating reminders and increasing your productivity.
          </Text>
          <Text style={styles.modalSubtitleText}>Controls</Text>
          <Text style={styles.normalText}>
            The buttons in the header are used for
            accessing settings, opening details,
            deleting all events and adding a custom
            event, respectively.
          </Text>
          <Text style={styles.modalSubtitleText}>Quick Actions</Text>
          <Text style={styles.normalText}>
            To easily add a default event, hold a
            time slot or an empty event slot. To
            delete a single event, hold the event.
          </Text>
          <Text style={styles.normalText}>Created by Noah do Régo</Text>
          <View style={styles.buttonContainer}>
            <IconButton icon={props => <Icon name="github" size={24} color="white" />} style={[styles.githubIcon, colors.darkGrey]} onPress={async () => Linking.openURL(githubURL)} />
            <IconButton icon={props => <Icon name="linkedin" size={24} color="white" />} style={[styles.linkedInIcon, colors.blue]} onPress={async () => Linking.openURL(linkedinURL)} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, colors.grey]}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={[styles.buttonText, colors.whiteText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalNew>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const colors = StyleSheet.create({
  black: { backgroundColor: "#000" },
  darkGrey: { backgroundColor: "#212121" },
  grey: { backgroundColor: '#4f4f4f' },
  lightGrey: { backgroundColor: '#767577' },
  green: { backgroundColor: "#47b356" },
  blue: { backgroundColor: "#325ea8" },
  red: { backgroundColor: "#e85b51" },
  white: { backgroundColor: "#fff" },
  whiteText: { color: "#fff" },
});

const margins = StyleSheet.create({
  m10: { margin: 10 },
  m12: { margin: 12 },
  m20: { margin: 20 },
})

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
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 5,
    marginLeft: "28%",
    padding: 25,
  },
  modalView: {
    alignItems: "center",
    margin: 10,
    flex: "auto",
    flexDirection: "column",
    marginTop: "12%",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewContainer: {
    flex: 1,
    flexDirection: "column",
  },
  modalButton: {
    width: 100,
    height: 40,
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
    elevation: 2,
  },
  clock12HourButton: {
    width: 80,
    height: 35,
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 5,
    elevation: 2,
  },
  clock24HourButton: {
    width: 80,
    height: 35,
    borderRadius: 30,
    padding: 10,
    marginLeft: 5,
    elevation: 2,
  },
  buttonContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 60,
  },
  buttonContainerSecondary: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: 'row',
    marginBottom: "4%",
    position: "absolute",
    alignSelf: "flex-end",
  },
  settingsContainer: {
    width: "100%",
    marginBottom: "4%",
  },
  colorPicker: {
    height: 80,
  },
  textInput: {
    height: "auto",
    margin: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    width: "90%",
  },
  timeDropdown: {
    margin: 5,
    borderRadius: 20,
    backgroundColor: "#4f4f4f",
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  normalText: {
    fontSize: 16,
    color: "#000",
    margin: 5,
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  modalSubtitleText: {
    fontSize: 20,
    margin: 10,
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
  settingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
    alignSelf: "flex-start",
  },
  settingsSwitch: {
    alignSelf: "flex-end",
    position: "absolute",
  },
  settingsIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    alignSelf: "flex-start",
    left: 20,
  },
  detailsIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    alignSelf: "flex-start",
    left: 75,
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
    alignSelf: "flex-end",
    right: 75,
  },
  linkedInIcon: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
  },
  githubIcon: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
  },
  extraSpace: {
    marginVertical: "3%",
  },
});
