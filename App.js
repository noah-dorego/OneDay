import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking, TextInput, Dimensions } from 'react-native';
import { IconButton, Switch } from '@react-native-material/core';
import ModalNew from "react-native-modal";
import Dialog from "react-native-dialog";
import SelectDropdown from 'react-native-select-dropdown';
import ColorPicker from 'react-native-wheel-color-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      title: "Test Notification",
      body: 'Event notifications will be added in a later update!',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 1 },
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
  const deviceHeight = Dimensions.get("window").height;

  // Platform.OS === "ios"
  //     ? Dimensions.get("window").height
  //     : require("react-native-extra-dimensions-android").get(
  //       "REAL_WINDOW_HEIGHT"
  //     );

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
  const [eventEndTime, setEventEndTime] = useState("");
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

  // Colours
  var defaultSlotsColor = !lightMode ? colors.grey : colors.lightGrey;
  var defaultTextColor = !lightMode ? colors.whiteText : colors.blackText;
  var statusBarStyle = !lightMode ? "light" : "dark";

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
    const savedEvents = getEventData();
    const newEvents = events.map((item) => {
      return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: defaultSlotsColor };
    });


    const firstLoad = async () => {
      try {
        const savedEvents = await getEventData();
        if (JSON.stringify(savedEvents) === "{}" || savedEvents === null) {
          storeEventData(newEvents);
          setEvents(newEvents);
        } else {
          setEvents(savedEvents);
          storeEventData(savedEvents);
        }
      } catch (err) {
        console.log(err);
        storeEventData(newEvents);
        setEvents(newEvents);
      }

    };

    // Set default time mode
    setTimeSetting(eventData._12hr_1h);
    setDayStartTime(newEvents[0].time);
    setDayEndTime(newEvents[newEvents.length - 1].time);

    firstLoad();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Save data method
  const storeEventData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@saved_events', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  // Get saved data method
  const getEventData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@saved_events')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  }

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
      return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: defaultSlotsColor };
    });
    setEvents(finalEvents);

  }

  const clearEvents = () => {
    const newEvents = events.map((item) => {
      return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: defaultSlotsColor };
    });
    setEvents(newEvents);
    storeEventData(newEvents);
    console.log("Deleted events.");
  }

  const refreshEvents = () => {
    const newEvents = events.map((item) => {
      return { time: item.time, event: item.event, color: defaultSlotsColor };
    });
    setEvents(newEvents);
    storeEventData(newEvents);
    console.log("Deleted events.");
  }

  const addEvent = (time, newEvent) => {
    setAddDialogVisible(false);
    if (newEvent === "") {
      newEvent = EMPTY_EVENT_PLACEHOLDER;
    }
    const newEvents = events.map((item) => {
      if (item.time === time) {
        return { time: item.time, event: newEvent, color: defaultSlotsColor };
      } else {
        return { time: item.time, event: item.event, color: item.color };
      }
    });
    setEvents(newEvents);
    storeEventData(newEvents);
    console.log("add event for" + time + " at time: " + currentHour + ":" + currentMin);
  }

  const addCustomEvent = (time, endTime, newEvent, customColor) => {

    // Check for invalid settings
    var invalidFlag, validFlag = false;

    if (invalidFlag) {
      alert("Invalid start/end time. Please try again.");
      return;
    } else if (validFlag) {
      setSettingsModalVisible(false);
    }

    var addFlag = false;

    setAddModalVisible(false);

    if (newEvent === "") {
      newEvent = EMPTY_EVENT_PLACEHOLDER;
    }

    const newEvents = events.map((item) => {
      if (item.time === time && item.time === endTime) {
        addFlag = false;
        return { time: item.time, event: newEvent, color: { backgroundColor: customColor } };
      } else if (item.time === time) {
        addFlag = true;
        return { time: item.time, event: newEvent, color: { backgroundColor: customColor } };
      } else if (addFlag === true && item.time === endTime) {
        addFlag = false;
        return { time: item.time, event: newEvent, color: { backgroundColor: customColor } };
      } else if (addFlag === true) {
        return { time: item.time, event: newEvent, color: { backgroundColor: customColor } };
      } else if (addFlag === false) {
        return { time: item.time, event: item.event, color: item.color };
      }
    });
    setEvents(newEvents);
    storeEventData(newEvents);
    console.log("add event " + time + " " + customColor);
  }

  const confirmAddEvent = (time) => {
    console.log("add quick event");
    setCurrentTime(time);
    setAddDialogVisible(true);
  }

  const removeEvent = (time) => {
    setAddDialogVisible(false);
    const newEvents = events.map((item) => {
      if (item.time === time) {
        return { time: item.time, event: EMPTY_EVENT_PLACEHOLDER, color: defaultSlotsColor };
      } else {
        return { time: item.time, event: item.event, color: item.color };
      }
    });
    setEvents(newEvents);
    storeEventData(newEvents);
    console.log("remove event " + time);
  }

  const eventSelected = (time, event) => {
    if (event === EMPTY_EVENT_PLACEHOLDER) {
      confirmAddEvent(time);
    } else {
      removeEvent(time);
    }
  }

  const closeModals = () => {
    setDetailsModalVisible(false);
    setAddModalVisible(false);
    setSettingsModalVisible(false);
  }

  async function setNotificationsForEvents(events) {
    events.map(async (item) => {
      if (item.event !== EMPTY_EVENT_PLACEHOLDER && notifications) {
        if (clockType === "24h") {
          var hourT = item.time.split(":")[0];
          var minuteT = item.time.split(":")[1];
          await Notifications.scheduleNotificationAsync({
            content: {
              title: item.event,
              body: 'Current event: ' + item.event,
            },
            trigger: {
              hour: parseInt(hourT),
              minute: parseInt(minuteT),
              repeat: repeat
            }
          });
        } else {
          var hourT = item.time.split(":")[0];
          if (clockType === "12h") {
            if (hourT === "12") {
              hourT === "0";
            }

            if (item.time.split(" ")[1] === "pm") {
              hourT = toString(parseInt(hourT) + 12)
            }
          }
          var minuteT = item.time.split(" ")[1] === "pm" ? item.time.split(":")[1].replace(" pm", "") : item.time.split(":")[1].replace(" am", "");
          await Notifications.scheduleNotificationAsync({
            content: {
              title: item.event,
              body: 'Current event: ' + item.event,
            },
            trigger: {
              hour: parseInt(hourT),
              minute: parseInt(minuteT),
              repeat: repeat
            }
          });
        }
      }
    });

    if (!notifications) {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  return (
    <SafeAreaView style={!lightMode ? [styles.mainContainer, colors.darkGrey] : [styles.mainContainer, colors.white]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.titleText, defaultTextColor]}>OneDay</Text>
        <CircularMenuButton iconName={"plus"} iconSize={24} iconColor={"white"} style={[styles.addIcon, colors.green]} action={() => setAddModalVisible(true)} />
        <CircularMenuButton iconName={"trash-2"} iconSize={20} iconColor={"white"} style={[styles.deleteIcon, colors.red]} action={deleteEvents} />
        <CircularMenuButton iconName={"settings"} iconSize={20} iconColor={"white"} style={[styles.settingsIcon, colors.grey]} action={() => setSettingsModalVisible(true)} />
        <CircularMenuButton iconName={"menu"} iconSize={20} iconColor={"white"} style={[styles.detailsIcon, colors.grey]} action={() => setDetailsModalVisible(true)} />
      </View>

      <ScrollView>
        {events.map((item, i) => {
          return (
            <View key={i}>
              <TouchableOpacity onPress={() => confirmAddEvent(item.time)} style={[styles.slotContainer, defaultSlotsColor]} key={item.time}>
                <Text style={[styles.timeSlotText12h, defaultTextColor]}>{item.time}</Text>
              </TouchableOpacity>
              <View style={[styles.emptyEventContainer, item.color]} key={item + " event"}>
                <Text style={[styles.timeEventText, defaultTextColor]} onLongPress={() => eventSelected(item.time, item.event)} numberOfLines={1}>{item.event}</Text>
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
        <Dialog.Input value={eventTitle} onChangeText={setEventTitle} numberOfLines={1} maxLength={50}></Dialog.Input>
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
          <CircularMenuButton iconName={"x"} iconSize={24} iconColor={"black"} style={styles.closeIcon} action={() => closeModals()} />
          <Text style={styles.modalTitleText}>Add Event</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Event Title"
            value={eventTitle}
            onChangeText={setEventTitle}
            numberOfLines={1}
            maxLength={50}
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
              setEventEndTime(selectedItem.time);
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
              onColorChangeComplete={(eventColor) => onColorChange(eventColor)}
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
              onPress={() => addCustomEvent(eventStartTime, eventEndTime, eventTitle, eventColor)}
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
          <CircularMenuButton iconName={"x"} iconSize={24} iconColor={"black"} style={styles.closeIcon} action={() => closeModals()} />
          <Text style={styles.modalTitleText}>Settings</Text>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingText}>Notifications</Text>
            <Switch
              style={styles.settingsSwitch}
              trackColor={{ false: colors.lightGrey, true: colors.green }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={async () => {
                setNotifications();
                try {
                  await schedulePushNotification();
                } catch (e) {
                  setNotifications(false);
                }

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
              onValueChange={() => {
                defaultSlotsColor = lightMode ? colors.grey : colors.lightGrey;
                setLightMode(!lightMode);
                refreshEvents();
              }}
              value={lightMode}
            />
          </View>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingText}>Clock Type</Text>
            <View style={styles.buttonContainerSecondary}>
              <TouchableOpacity
                style={clockType === "12h" ? [styles.clockSettingLeftButton, colors.green] : [styles.clockSettingLeftButton, colors.grey]}
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
                style={clockType === "24h" ? [styles.clockSettingRightButton, colors.green] : [styles.clockSettingRightButton, colors.grey]}
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
                style={interval === "1h" ? [styles.clockSettingLeftButton, colors.green] : [styles.clockSettingLeftButton, colors.grey]}
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
                style={interval === "30min" ? [styles.clockSettingRightButton, colors.green] : [styles.clockSettingRightButton, colors.grey]}
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
          <CircularMenuButton iconName={"x"} iconSize={24} iconColor={"black"} style={styles.closeIcon} action={() => closeModals()} />
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

      <StatusBar style={statusBarStyle} />
    </SafeAreaView>
  );
}