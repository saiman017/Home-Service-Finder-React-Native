import React from "react";
import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { View, Text } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading, role } = useSelector((state: RootState) => state.auth);

  console.log(role, isAuthenticated);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const roleLowerCase = role ? role.toLowerCase() : "";
  console.log(role);

  if (isAuthenticated && roleLowerCase === "customer") {
    return <Redirect href="/(tabs)/home" />;
  } else if (isAuthenticated && roleLowerCase === "serviceprovider") {
    return <Redirect href="/(serviceProvider)/(tab)/home" />;
  } else if (!isAuthenticated) {
    return <Redirect href="/(auth)/Landing" />;
  } else {
    return <Redirect href="/(auth)/Landing" />;
  }
}
