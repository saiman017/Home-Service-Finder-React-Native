import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { HeaderBackButton } from "@react-navigation/elements";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#000" },
        }}
      >
        <Stack.Screen name="Landing" />

        <Stack.Screen
          name="login"
          options={{
            title: "Login",
          }}
        />

        <Stack.Screen name="SignUp" />
      </Stack>
    </>
  );
}
