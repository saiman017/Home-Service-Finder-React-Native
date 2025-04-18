import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { ScreenWrapperProps } from "@/types/types";

const { height } = Dimensions.get("window");
let paddingTop = Platform.OS == "ios" ? height * 0.06 : 50;

function ScreenWrapper({ style, children }: ScreenWrapperProps) {
  return (
    <View style={[{ paddingTop, flex: 1, backgroundColor: "#ffffff" }, style]}>
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
}

export default ScreenWrapper;
