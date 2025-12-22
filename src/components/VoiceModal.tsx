import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTaskProcessor } from "../hooks/useTaskProcessor";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useTaskStore } from "../store/useTaskStore";
import { useThemeStore } from "../store/useThemeStore";
import { borderRadius, spacing } from "../theme/spacing";
import AppText from "./AppText";
import VoiceSplitModal from "./VoiceSplitModal";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const VoiceModal: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useThemeStore((state) => state.theme);
  const addTask = useTaskStore((state) => state.addTask);
  const addTasks = useTaskStore((state) => state.addTasks);

  const {
    isRecording,
    recordingUri,
    startRecording,
    stopRecording,
    error: recordingError,
  } = useVoiceRecorder();

  const {
    isProcessing,
    originalText,
    suggestedTasks,
    processAudioToTasks,
    clearResults,
  } = useTaskProcessor();

  const [showSplitModal, setShowSplitModal] = useState(false);

  // animation
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withTiming(1.2, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleRecordPress = useCallback(async () => {
    if (isRecording) {
      await stopRecording();

      // process audio
      try {
        await processAudioToTasks(recordingUri);
        setShowSplitModal(true);
      } catch (error) {
        Alert.alert(
          "Processing Error",
          error instanceof Error ? error.message : "Failed to process audio"
        );
      }
    } else {
      await startRecording();
    }
  }, [
    isRecording,
    recordingUri,
    processAudioToTasks,
    startRecording,
    stopRecording,
  ]);

  const handleSaveOriginal = useCallback(async () => {
    if (!originalText) return;

    try {
      addTask({ title: originalText, isCompleted: false });
      setShowSplitModal(false);
      clearResults();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save task");
    }
  }, [originalText, addTask, clearResults, onClose]);

  const handleSaveSuggested = useCallback(async () => {
    if (suggestedTasks.length === 0) return;

    try {
      addTasks(
        suggestedTasks.map((task) => ({
          title: task.title,
          description: task.description,
          isCompleted: false,
        }))
      );
      setShowSplitModal(false);
      clearResults();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save tasks");
    }
  }, [suggestedTasks, addTasks, clearResults, onClose]);

  const handleCancel = useCallback(() => {
    setShowSplitModal(false);
    clearResults();
  }, [clearResults]);

  const handleClose = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    clearResults();
    onClose();
  }, [isRecording, stopRecording, clearResults, onClose]);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View
            style={[styles.container, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.header}>
              <Feather name="mic" size={24} color={theme.colors.primary} />
              <AppText variant="title" style={styles.title}>
                Voice Add Task
              </AppText>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.instructions}>
                <Feather name="info" size={20} color={theme.colors.primary} />
                <AppText style={styles.instructionText} color="secondary">
                  {isRecording
                    ? "Recording... Tap to stop"
                    : "Tap the microphone to record your task"}
                </AppText>
              </View>

              <View style={styles.recordingContainer}>
                <Animated.View style={animatedStyle}>
                  <TouchableOpacity
                    style={[
                      styles.recordButton,
                      {
                        backgroundColor: isRecording
                          ? theme.colors.error
                          : theme.colors.primary,
                      },
                    ]}
                    onPress={handleRecordPress}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    ) : (
                      <Feather
                        name={isRecording ? "square" : "mic"}
                        size={48}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View
                      style={[
                        styles.recordingDot,
                        { backgroundColor: theme.colors.error },
                      ]}
                    />
                    <AppText color="secondary">
                      Recording in progress...
                    </AppText>
                  </View>
                )}

                {isProcessing && (
                  <AppText color="secondary" style={styles.processingText}>
                    Processing your voice...
                  </AppText>
                )}
              </View>

              <View style={styles.infoBox}>
                <AppText variant="subtitle" style={styles.infoTitle}>
                  How it works:
                </AppText>
                <AppText color="secondary" style={styles.infoItem}>
                  • Record single or multiple tasks
                </AppText>
                <AppText color="secondary" style={styles.infoItem}>
                  • AI will transcribe and split compound tasks
                </AppText>
                <AppText color="secondary" style={styles.infoItem}>
                  • Review and choose what to save
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <VoiceSplitModal
        visible={showSplitModal}
        originalText={originalText || ""}
        suggestedTasks={suggestedTasks}
        onSaveOriginal={handleSaveOriginal}
        onSaveSuggested={handleSaveSuggested}
        onCancel={handleCancel}
      />
    </>
  );
};

export default VoiceModal;

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
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  instructions: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  instructionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  recordingContainer: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  processingText: {
    marginTop: spacing.lg,
  },
  infoBox: {
    marginTop: spacing.xl,
  },
  infoTitle: {
    marginBottom: spacing.md,
  },
  infoItem: {
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});
