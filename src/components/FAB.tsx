import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useThemeStore } from "../store/useThemeStore";
import { spacing } from "../theme/spacing";

interface Props {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
}

const FAB: React.FC<Props> = ({ icon, onPress, style, size = 64 }) => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: theme.colors.primary,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name={icon} size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

export default FAB;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
