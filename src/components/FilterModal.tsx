import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeStore } from "../store/useThemeStore";
import { borderRadius, spacing } from "../theme/spacing";
import AppText from "./AppText";
import { SortOrder } from "../types";

interface Props {
  visible: boolean;
  currentSort: SortOrder;
  onSelectSort: (sort: SortOrder) => void;
  onClose: () => void;
}

interface SortOption {
  value: SortOrder;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const sortOptions: SortOption[] = [
  {
    value: "title-asc",
    label: "Title (A-Z)",
    icon: "sort-alphabetical-ascending",
  },
  {
    value: "title-desc",
    label: "Title (Z-A)",
    icon: "sort-alphabetical-descending",
  },
  {
    value: "dueDate-asc",
    label: "Due Date (Earliest)",
    icon: "sort-calendar-ascending",
  },
  {
    value: "dueDate-desc",
    label: "Due Date (Latest)",
    icon: "sort-calendar-descending",
  },
];

const FilterModal: React.FC<Props> = ({
  visible,
  currentSort,
  onSelectSort,
  onClose,
}) => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.container, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.header}>
            <Feather name="sliders" size={24} color={theme.colors.primary} />
            <AppText variant="title" style={styles.title}>
              Sort Tasks
            </AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      currentSort === option.value
                        ? theme.colors.primary + "15"
                        : "transparent",
                    borderColor:
                      currentSort === option.value
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() => {
                  onSelectSort(option.value);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={20}
                    color={
                      currentSort === option.value
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                  <AppText
                    style={[
                      styles.optionText,
                      {
                        color:
                          currentSort === option.value
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </AppText>
                </View>
                {currentSort === option.value && (
                  <Feather
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "92%",
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  title: {
    flex: 1,
    marginLeft: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  optionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    marginLeft: spacing.md,
    fontSize: 16,
  },
});
