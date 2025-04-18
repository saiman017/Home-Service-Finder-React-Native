import React, { ReactNode } from "react";
import { ViewStyle } from "react-native";

export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
  bg?: string;
};
