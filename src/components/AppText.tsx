import { StyleSheet, Text, TextProps, View } from "react-native";
import React from "react";
import { useThemeStore } from "../store/useThemeStore";

interface Props extends TextProps {
  variant?: "body" | "title" | "subtitle" | "caption";
  color?: "primary" | "secondary";
}

const AppText: React.FC<Props> = ({
  variant = "body",
  color,
  style,
  children,
  ...props
}) => {
  const theme = useThemeStore((state) => state.theme);

  const textColor =
    color === "secondary"
      ? theme.colors.textSecondary
      : color === "primary"
      ? theme.colors.primary
      : theme.colors.text;

  const variantStyle = styles[variant];

  return (
    <Text style={[variantStyle, { color: textColor }, style]} {...props}>
      {children}
    </Text>
  );
};

export default AppText;

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 28,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
});
