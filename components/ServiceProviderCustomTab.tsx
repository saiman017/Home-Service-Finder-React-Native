// CustomTabBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

type TabIconRenderer = (isFocused: boolean) => React.ReactNode;

function ServiceProviderCustomTabBar(props: any) {
  const { state, descriptors, navigation } = props;

  const tabbarIcons: Record<string, TabIconRenderer> = {
    home: (isFocused: boolean) => (
      <MaterialCommunityIcons
        name={isFocused ? "home" : "home-outline"}
        size={verticalScale(23)}
        color={isFocused ? "#3F63C7" : "#808080"}
      />
    ),
    customerRequest: (isFocused: boolean) => (
      <MaterialIcons
        name={isFocused ? "list-alt" : "list-alt"}
        size={verticalScale(23)}
        color={isFocused ? "#3F63C7" : "#808080"}
      />
    ),
    providerOffersList: (isFocused: boolean) => (
      <Ionicons
        name={isFocused ? "time" : "time-outline"}
        size={verticalScale(23)}
        color={isFocused ? "#3F63C7" : "#808080"}
      />
    ),
    accountAndSettings: (isFocused: boolean) => (
      <Ionicons
        name={isFocused ? "person-circle" : "person-circle-outline"}
        size={verticalScale(23)}
        color={isFocused ? "#3F63C7" : "#808080"}
      />
    ),
  };

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabItem}
          >
            {tabbarIcons[route.name] && tabbarIcons[route.name](isFocused)}
            <Text
              style={[
                styles.tabText,
                { color: isFocused ? "#3F63C7" : "#808080", fontWeight: 400 },
              ]}
            >
              {typeof label === "string" ? label : route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    height: 70,
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    paddingTop: 10,
    elevation: 5,
    borderTopWidth: 1,
    borderColor: "#EEEEEE",
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});

export default ServiceProviderCustomTabBar;
