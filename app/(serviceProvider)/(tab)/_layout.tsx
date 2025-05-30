import { Tabs } from "expo-router";
import React from "react";
import ServiceProviderCustomTabBar from "@/components/ServiceProviderCustomTab";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <ServiceProviderCustomTabBar {...props} />}
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
        name="customerRequest"
        options={{
          tabBarLabel: "Customer Request",
        }}
      />
      <Tabs.Screen
        name="providerOffersList"
        options={{
          tabBarLabel: "Offer Request",
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
