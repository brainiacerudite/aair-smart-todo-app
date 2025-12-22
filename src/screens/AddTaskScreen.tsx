import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "../components/AppText";
import { useTaskProcessor } from "../hooks/useTaskProcessor";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTaskStore } from "../store/useTaskStore";
import { useThemeStore } from "../store/useThemeStore";
import { borderRadius, spacing } from "../theme/spacing";

type Props = NativeStackScreenProps<RootStackParamList, "AddTask">;

const AddTaskScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useThemeStore((state) => state.theme);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const tasks = useTaskStore((state) => state.tasks);

  const taskId = route.params?.taskId;
  const existingTask = taskId
    ? tasks.find((task) => task.id === taskId)
    : undefined;
  const isEditMode = !!existingTask;

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(
    existingTask?.description || ""
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecordingTitle, setIsRecordingTitle] = useState(false);

  const { isRecording, recordingUri, startRecording, stopRecording } =
    useVoiceRecorder();

  const { isProcessing, processAudioToText } = useTaskProcessor();

  const handleVoiceTitleInput = useCallback(async () => {
    if (isRecording) {
      setIsRecordingTitle(false);
      await stopRecording();

      try {
        const transcribedText = await processAudioToText(recordingUri);
        setTitle(transcribedText);
      } catch (error) {
        Alert.alert(
          "Voice Input Error",
          error instanceof Error
            ? error.message
            : "Failed to process voice input"
        );
      }
    } else {
      setIsRecordingTitle(true);
      await startRecording();
    }
  }, [
    isRecording,
    recordingUri,
    startRecording,
    stopRecording,
    processAudioToText,
  ]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a task title");
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? dueDate.getTime() : undefined,
      isCompleted: existingTask?.isCompleted || false,
    };

    if (isEditMode && taskId) {
      updateTask(taskId, taskData);
      Alert.alert("Success", "Task updated successfully");
    } else {
      addTask(taskData);
      Alert.alert("Success", "Task added successfully");
    }

    navigation.goBack();
  }, [
    title,
    description,
    dueDate,
    existingTask,
    isEditMode,
    taskId,
    addTask,
    updateTask,
    navigation,
  ]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setDueDate(selectedDate);
      if (Platform.OS === "ios") {
        setShowDatePicker(false);
      }
    } else if (event.type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  const clearDueDate = () => {
    setDueDate(undefined);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <AppText variant="title" style={styles.headerTitle}>
          {isEditMode ? "Edit Task" : "Add Task"}
        </AppText>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* title input */}
          <View style={styles.inputGroup}>
            <AppText variant="subtitle" style={styles.label}>
              Title *
            </AppText>
            <View style={styles.titleInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.titleInput,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Enter task title"
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                multiline={false}
                autoComplete="off"
              />
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  {
                    backgroundColor: isRecordingTitle
                      ? theme.colors.error
                      : theme.colors.primary,
                  },
                ]}
                onPress={handleVoiceTitleInput}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather
                    name={isRecordingTitle ? "square" : "mic"}
                    size={18}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            </View>
            {isRecordingTitle && (
              <AppText
                variant="caption"
                color="secondary"
                style={styles.recordingHint}
              >
                Recording... Tap mic to stop
              </AppText>
            )}
          </View>

          {/* description input */}
          <View style={styles.inputGroup}>
            <AppText variant="subtitle" style={styles.label}>
              Description
            </AppText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Add task details (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* dueDate picker */}
          <View style={styles.inputGroup}>
            <AppText variant="subtitle" style={styles.label}>
              Due Date
            </AppText>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Feather
                name="calendar"
                size={20}
                color={
                  dueDate ? theme.colors.primary : theme.colors.textSecondary
                }
              />
              <AppText
                style={styles.dateText}
                color={dueDate ? undefined : "secondary"}
              >
                {dueDate
                  ? dueDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Select due date (optional)"}
              </AppText>
              {dueDate && (
                <TouchableOpacity
                  onPress={clearDueDate}
                  style={styles.clearDateButton}
                >
                  <Feather name="x" size={18} color={theme.colors.text} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* add button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Feather name="check" size={24} color="#FFFFFF" />
          <AppText style={styles.saveButtonText}>
            {isEditMode ? "Update Task" : "Add Task"}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* date picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
          themeVariant={theme.mode === "dark" ? "dark" : "light"}
        />
      )}
    </SafeAreaView>
  );
};

export default AddTaskScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    // borderBottomWidth: 1,
  },
  backButton: {
    marginLeft: -(spacing.md - spacing.xs),
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
  },
  titleInput: {
    flex: 1,
    paddingRight: spacing.xxl + spacing.sm,
  },
  titleInputContainer: {
    position: "relative",
  },
  voiceButton: {
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingHint: {
    marginTop: spacing.xs,
  },
  textArea: {
    minHeight: 100,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  dateText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 16,
  },
  clearDateButton: {
    padding: spacing.xs,
  },
  footer: {
    padding: spacing.md,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 52,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
});
