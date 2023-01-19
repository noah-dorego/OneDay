import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking, TextInput, Dimensions } from 'react-native';
import { IconButton, Switch } from '@react-native-material/core';
import ModalNew from "react-native-modal";
import Dialog from "react-native-dialog";
import SelectDropdown from 'react-native-select-dropdown';
import ColorPicker from 'react-native-wheel-color-picker';
import Icon from "@expo/vector-icons/Feather";
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// styles
import styles from 'app/styling/mainstyles';
import colors from 'app/styling/colors';
import margins from 'app/styling/margins';

// Components
import CircularMenuButton from "app/components/buttons/CircularMenuButton";

// Functions
import generateSchedule from 'app/functions/GenerateSchedule';

// Json
import eventData from "app/json/timeEvents"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Event",
      body: 'Here is the notification body',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

export default function App() {

  // Vars
  const EMPTY_EVENT_PLACEHOLDER = " ";
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

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

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
  const [interval, setInterval] = useState("1h");
  const [clockType, setClockType] = useState("12h");
  const [timeSetting, setTimeSetting] = useState(eventData._12hr_1h);
  const [dayStartTime, setDayStartTime] = useState("");
  const [dayEndTime, setDayEndTime] = useState("");

  const [events, setEvents] = useState(
    eventData._12hr_1h
  );

  useEffect(() => {
    // Set up Notifications
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    // Set background color for default events
    const newEvents = events.map((item) => {
      return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey };
    });
    setEvents(newEvents);

    setTimeSetting(eventData._12hr_1h);
    setDayStartTime(newEvents[0].time);
    setDayEndTime(newEvents[newEvents.length - 1].time);

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const onColorChange = eventColor => {
    setEventColor(eventColor);
  };

  const deleteEvents = () => {
    return Alert.alert("Delete all events?", "You cannot undo this action.", [
      { text: "Yes", onPress: () => clearEvents() },
      { text: "No", onPress: () => console.log("Cancelled event deletion.") },
    ]);
  }

  const warnSavingSettings = () => {
    return Alert.alert("Save new settings?", "Saving new settings will overwrite your current events.", [
      { text: "Yes", onPress: () => applySettings() },
      { text: "Cancel" },
    ]);
  }

  const applySettings = () => {

    // Check for invalid settings
    if (dayStartTime === dayEndTime) {
      alert("Invalid start/end time. Please try again.");
      return;
    } else {
      setSettingsModalVisible(false);
    }

    // set schedule and start/end time (use consts to set events instead of "events")
    const newEvents = generateSchedule(timeSetting, dayStartTime, dayEndTime);
    setEvents(newEvents);
    const finalEvents = newEvents.map((item) => {
      return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey };
    });
    setEvents(finalEvents);

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
      newEvent = EMPTY_EVENT_PLACEHOLDER;
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
      newEvent = EMPTY_EVENT_PLACEHOLDER;
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
        return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: colors.grey };
      } else {
        return { time: item.time, event: item.event, color: item.color };
      }
    });
    setEvents(newEvents);
    console.log("remove event " + time);
  }

  const eventSelected = (time, event) => {
    if (event === EMPTY_EVENT_PLACEHOLDER) {
      confirmAddEvent(time);
    } else {
      removeEvent(time);
    }
  }

  return (
    <SafeAreaView style={[styles.mainContainer, colors.darkGrey]}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>OneDay</Text>
        <CircularMenuButton iconName={"plus"} iconSize={24} iconColor={"white"} style={[styles.addIcon, colors.green]} action={() => setAddModalVisible(true)} />
        <CircularMenuButton iconName={"trash-2"} iconSize={20} iconColor={"white"} style={[styles.deleteIcon, colors.red]} action={deleteEvents} />
        <CircularMenuButton iconName={"settings"} iconSize={20} iconColor={"white"} style={[styles.settingsIcon, colors.grey]} action={() => setSettingsModalVisible(true)} />
        <CircularMenuButton iconName={"menu"} iconSize={20} iconColor={"white"} style={[styles.detailsIcon, colors.grey]} action={() => setDetailsModalVisible(true)} />
      </View>

      <ScrollView>
        {events.map((item, i) => {
          return (
            <View key={i}>
              <TouchableOpacity onLongPress={() => confirmAddEvent(item.time)} style={styles.slotContainer} key={item.time}>
                <Text style={styles.timeSlotText12h}>{item.time}</Text>
              </TouchableOpacity>
              <View style={[styles.emptyEventContainer, item.color]} key={item + " event"}>
                <Text style={styles.timeEventText} onLongPress={() => eventSelected(item.time, item.event)}>{item.event}</Text>
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
              onValueChange={async () => {
                await schedulePushNotification();
                setNotifications();
              }}
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
                onPress={() => {
                  setClockType("12h");
                  if (interval === "1h") {
                    setTimeSetting(eventData._12hr_1h);
                    setDayStartTime(eventData._12hr_1h[0].time)
                    setDayEndTime(eventData._12hr_1h[timeSetting.length - 1].time);
                  } else {
                    setTimeSetting(eventData._12hr_30min);
                    setDayStartTime(eventData._12hr_30min[0].time)
                    setDayEndTime(eventData._12hr_30min[timeSetting.length - 1].time);
                  }
                }}
              >
                <Text style={[styles.buttonText, colors.whiteText]}>12 hour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.clock24HourButton, colors.green]}
                onPress={() => {
                  setClockType("24h");
                  if (interval === "1h") {
                    setTimeSetting(eventData._24hr_1h);
                    setDayStartTime(eventData._24hr_1h[0].time)
                    setDayEndTime(eventData._24hr_1h[timeSetting.length - 1].time);
                  } else {
                    setTimeSetting(eventData._24hr_30min);
                    setDayStartTime(eventData._24hr_30min[0].time)
                    setDayEndTime(eventData._24hr_30min[timeSetting.length - 1].time);
                  }
                }}
              >
                <Text style={[styles.buttonText, colors.whiteText]}>24 hour</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingText}>Intervals</Text>
            <View style={styles.buttonContainerSecondary}>
              <TouchableOpacity
                style={[styles.clock12HourButton, colors.green]}
                onPress={() => {
                  setInterval("1h");
                  if (clockType === "12h") {
                    setTimeSetting(eventData._12hr_1h);
                    setDayStartTime(eventData._12hr_1h[0].time)
                    setDayEndTime(eventData._12hr_1h[eventData._12hr_1h.length - 1].time);
                  } else {
                    setTimeSetting(eventData._24hr_1h);
                    setDayStartTime(eventData._24hr_1h[0].time)
                    setDayEndTime(eventData._24hr_1h[eventData._24hr_1h.length - 1].time);
                  }
                }}
              >
                <Text style={[styles.buttonText, colors.whiteText]}>1 hour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.clock24HourButton, colors.green]}
                onPress={() => {
                  setInterval("30min");
                  if (clockType === "12h") {
                    setTimeSetting(eventData._12hr_30min);
                    setDayStartTime(eventData._12hr_30min[0].time)
                    setDayEndTime(eventData._12hr_30min[eventData._12hr_30min.length - 1].time);
                  } else {
                    setTimeSetting(eventData._24hr_30min);
                    setDayStartTime(eventData._24hr_30min[0].time)
                    setDayEndTime(eventData._24hr_30min[eventData._24hr_30min.length - 1].time);
                  }
                }}
              >
                <Text style={[styles.buttonText, colors.whiteText]}>30 min.</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.extraSpace} />
          <SelectDropdown
            buttonStyle={styles.timeDropdown}
            buttonTextStyle={styles.whiteBodyText}
            defaultButtonText={`Start Time:  ${dayStartTime}`}
            renderDropdownIcon={() => { return <Icon name="chevron-down" size={20} color="white" /> }}
            data={timeSetting}
            onSelect={(selectedItem, index) => {
              setDayStartTime(selectedItem.time);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return "Start Time: " + dayStartTime
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
            defaultButtonText={`End Time:  ${dayEndTime}`}
            renderDropdownIcon={() => { return <Icon name="chevron-down" size={20} color="white" /> }}
            data={timeSetting}
            onSelect={(selectedItem, index) => {
              setDayEndTime(selectedItem.time);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return "End Time: " + dayEndTime
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
              onPress={() => warnSavingSettings()}
            >
              <Text style={[styles.buttonText, colors.whiteText]}>Save</Text>
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