import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeStore } from "../store/useThemeStore";
import { borderRadius, spacing } from "../theme/spacing";
import { ParsedTask } from "../types";
import AppText from "./AppText";

interface Props {
  visible: boolean;
  originalText: string;
  suggestedTasks: ParsedTask[];
  onSaveOriginal: () => void;
  onSaveSuggested: () => void;
  onCancel: () => void;
}

const VoiceSplitModal: React.FC<Props> = ({
  visible,
  originalText,
  suggestedTasks,
  onSaveOriginal,
  onSaveSuggested,
  onCancel,
}) => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.header}>
            <AppText variant="title">Voice Recording Result</AppText>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* original transciption */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="mic" size={20} color={theme.colors.primary} />
                <AppText variant="subtitle" style={styles.sectionTitle}>
                  Original Transcription
                </AppText>
              </View>
              <View
                style={[
                  styles.box,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <AppText>{originalText}</AppText>
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.secondaryButton,
                  { borderColor: theme.colors.primary },
                ]}
                onPress={onSaveOriginal}
              >
                <AppText color="primary">Save as Single Task</AppText>
              </TouchableOpacity>
            </View>

            {/* AI suggestions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="list" size={20} color={theme.colors.success} />
                <AppText variant="subtitle" style={styles.sectionTitle}>
                  AI Suggestions ({suggestedTasks.length} tasks)
                </AppText>
              </View>
              {suggestedTasks.map((task, index) => (
                <View
                  key={index}
                  style={[
                    styles.taskBox,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.taskNumber}>
                    <AppText variant="caption" color="primary">
                      {index + 1}
                    </AppText>
                  </View>
                  <View style={styles.taskContent}>
                    <AppText style={styles.taskTitle}>{task.title}</AppText>
                    {task.description && (
                      <AppText variant="caption" color="secondary">
                        {task.description}
                      </AppText>
                    )}
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={onSaveSuggested}
              >
                <AppText style={styles.primaryButtonText}>
                  Save All {suggestedTasks.length} Tasks
                </AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default VoiceSplitModal;

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginLeft: spacing.sm,
  },
  box: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  taskBox: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  taskNumber: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    marginBottom: spacing.xs,
  },
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
