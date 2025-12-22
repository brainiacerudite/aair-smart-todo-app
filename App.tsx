import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useThemeStore } from "./src/store/useThemeStore";

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <GestureHandlerRootView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <RootNavigator />
      <StatusBar style={theme.mode === "light" ? "dark" : "light"} />
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
