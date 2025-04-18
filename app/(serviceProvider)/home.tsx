import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slice/auth";
import { router } from "expo-router";

export default function Home() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/(auth)/Landing");
  };
  return (
    <View>
      <Text>Service Provider Home</Text>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
