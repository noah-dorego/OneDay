import React, { Component } from "react";
import { IconButton } from '@react-native-material/core';
import Icon from "@expo/vector-icons/Feather";

import styles from "app/styling/mainstyles";
import colors from "app/styling/colors";

class SettingsButton extends Component {
    render() {
        <IconButton icon={props => <Icon name="settings" size={20} color="white" />} style={[styles.settingsIcon, colors.grey]} onPress={() => setSettingsModalVisible(true)} />
    }
}

export default SettingsButton;