import React, { Component } from "react";
import { IconButton } from '@react-native-material/core';
import Icon from "@expo/vector-icons/Feather";

import styles from "app/styling/mainstyles";
import colors from "app/styling/colors";

function CircularMenuButton(buttonProps) {
    return (
        <IconButton icon={props => <Icon name={buttonProps.iconName} size={buttonProps.iconSize} color={buttonProps.iconColor} />} style={buttonProps.style} onPress={buttonProps.action} />
    );
}

export default CircularMenuButton;