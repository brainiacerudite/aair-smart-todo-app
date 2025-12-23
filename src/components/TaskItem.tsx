import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useThemeStore } from "../store/useThemeStore";
import { borderRadius, spacing } from "../theme/spacing";
import { Task } from "../types";
import AppText from "./AppText";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: () => void;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onDelete, onPress }) => {
  const theme = useThemeStore((state) => state.theme);
  const [showTooltip, setShowTooltip] = useState(false);

  const renderRightActions = (
    progress: SharedValue<number>,
    drag: SharedValue<number>
  ) => {
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        drag.value,
        [-100, 0],
        [1, 0],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ scale }],
      };
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Reanimated.View style={animatedStyle}>
          <Feather name="trash-2" size={24} color={theme.colors.error} />
        </Reanimated.View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Modal
        visible={showTooltip}
        transparent
        animationType="none"
        onRequestClose={() => setShowTooltip(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTooltip(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
      </Modal>

      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.checkboxButton, { alignSelf: "flex-start" }]}
            onPress={() => onToggle(task.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={task.isCompleted ? "checkbox" : "square-outline"}
              size={24}
              color={
                task.isCompleted
                  ? theme.colors.success
                  : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textContainer}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
          >
            <View style={styles.titleRow}>
              <AppText
                variant="subtitle"
                style={[styles.title, task.isCompleted && styles.completedText]}
                numberOfLines={1}
              >
                {task.title}
              </AppText>
            </View>

            {task.description && (
              <AppText
                variant="body"
                color="secondary"
                style={[
                  styles.description,
                  task.isCompleted && styles.completedText,
                ]}
                numberOfLines={1}
              >
                {task.description}
              </AppText>
            )}

            {task.dueDate && (
              <View style={styles.dueDateContainer}>
                <Feather
                  name="calendar"
                  size={12}
                  color={theme.colors.textSecondary}
                  style={[task.isCompleted && { opacity: 0.6 }]}
                />
                <AppText
                  variant="caption"
                  style={[
                    styles.dueDate,
                    { color: theme.colors.textSecondary },
                    task.isCompleted && { opacity: 0.6 },
                  ]}
                >
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year:
                      new Date(task.dueDate).getFullYear() !==
                      new Date().getFullYear()
                        ? "numeric"
                        : undefined,
                  })}
                </AppText>
              </View>
            )}
          </TouchableOpacity>

          {/* swipe to delete hint */}
          <TouchableOpacity
            style={styles.swipeHint}
            onPress={() => setShowTooltip(!showTooltip)}
            activeOpacity={0.7}
          >
            <Feather
              name="chevrons-left"
              size={16}
              color={theme.colors.textSecondary}
              style={{ opacity: 0.3 }}
            />
          </TouchableOpacity>

          {/* tooltip */}
          {showTooltip && (
            <View style={styles.tooltipContainer}>
              <View
                style={[
                  styles.tooltipContent,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Feather
                  name="chevrons-left"
                  size={14}
                  color={theme.colors.text}
                />
                <AppText
                  variant="caption"
                  style={[styles.tooltipText, { color: theme.colors.text }]}
                >
                  Swipe left to delete
                </AppText>
              </View>
              <View
                style={[
                  styles.tooltipArrow,
                  { borderLeftColor: theme.colors.background },
                ]}
              />
            </View>
          )}
        </View>
      </Swipeable>
    </>
  );
};

export default TaskItem;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  checkboxButton: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
    marginBottom: 0,
    fontWeight: "500",
  },
  description: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  dueDate: {
    marginLeft: spacing.xs,
    fontSize: 11,
    fontWeight: "500",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  swipeHint: {
    marginLeft: spacing.sm,
    paddingLeft: spacing.xs,
  },
  tooltipContainer: {
    position: "absolute",
    right: spacing.lg + spacing.sm,
    top: "50%",
    marginTop: -20,
    zIndex: 1000,
  },
  tooltipContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    fontWeight: "600",
    fontSize: 12,
  },
  tooltipArrow: {
    position: "absolute",
    right: -6,
    top: "50%",
    marginTop: -6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: "transparent",
    borderBottomWidth: 6,
    borderBottomColor: "transparent",
    borderLeftWidth: 6,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
});
