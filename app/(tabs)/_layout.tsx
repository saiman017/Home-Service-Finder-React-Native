import { Tabs } from "expo-router";
import React from "react";
import CustomTabBar from "@/components/CustomTab"; // Update the import path as needed

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: "History",
        }}
      />
      <Tabs.Screen
        name="accountAndSettings"
        options={{
          tabBarLabel: "Account",
        }}
      />
    </Tabs>
  );
}
