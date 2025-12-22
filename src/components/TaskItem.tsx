import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
        <View style={styles.swipeHint}>
          <Feather
            name="chevrons-left"
            size={16}
            color={theme.colors.textSecondary}
            style={{ opacity: 0.3 }}
          />
        </View>
      </View>
    </Swipeable>
  );
};

export default TaskItem;

const styles = StyleSheet.create({
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
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
});
