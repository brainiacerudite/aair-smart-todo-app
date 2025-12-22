import { Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  Alert,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "../components/AppText";
import FAB from "../components/FAB";
import FilterModal from "../components/FilterModal";
import TaskItem from "../components/TaskItem";
import VoiceModal from "../components/VoiceModal";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTaskStore } from "../store/useTaskStore";
import { useThemeStore } from "../store/useThemeStore";
import { borderRadius, fontSize, spacing } from "../theme/spacing";
import { TaskSection } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "TaskList">;

const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const tasks = useTaskStore((state) => state.tasks);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const sortOrder = useTaskStore((state) => state.sortOrder);
  const setSortOrder = useTaskStore((state) => state.setSortOrder);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "dueDate-asc":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate - b.dueDate;
        case "dueDate-desc":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate - a.dueDate;
        default:
          return 0;
      }
    });

    return sorted;
  }, [tasks, searchQuery, sortOrder]);

  const sections: TaskSection[] = useMemo(() => {
    const pending = filteredTasks.filter((task) => !task.isCompleted);
    const completed = filteredTasks.filter((task) => task.isCompleted);

    return [
      { title: "Pending", data: pending },
      { title: "Completed", data: completed },
    ].filter((section) => section.data.length > 0);
  }, [filteredTasks]);

  const handleDelete = (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(id),
      },
    ]);
  };

  const renderSectionHeader = ({ section }: { section: TaskSection }) => (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <AppText variant="subtitle">{section.title}</AppText>
      <AppText variant="body" color="secondary">
        {section.data.length} {section.data.length === 1 ? "task" : "tasks"}
      </AppText>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather
        name="check-circle"
        size={64}
        color={theme.colors.textSecondary}
      />
      <AppText variant="title" style={styles.emptyTitle}>
        No Tasks Yet
      </AppText>
      <AppText color="secondary" style={styles.emptySubtitle}>
        Tap the + icon to add a task or the microphone for voice entry
      </AppText>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <AppText variant="title">AAIR TODO</AppText>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddTask")}
            style={styles.themeButton}
          >
            <Feather name="plus" size={26} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            <Feather
              name={theme.mode === "light" ? "moon" : "sun"}
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* search bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: theme.colors.card, color: theme.colors.text },
            ]}
            placeholder="Search tasks..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={[styles.filterButton, { backgroundColor: theme.colors.card }]}
        >
          <Feather name="sliders" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={toggleTask}
            onDelete={handleDelete}
            onPress={() => navigation.navigate("AddTask", { taskId: item.id })}
          />
        )}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={
          sections.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmptyComponent}
        stickySectionHeadersEnabled={false}
      />

      <FAB icon="mic" onPress={() => setShowVoiceModal(true)} />

      <FilterModal
        visible={showFilterModal}
        currentSort={sortOrder}
        onSelectSort={setSortOrder}
        onClose={() => setShowFilterModal(false)}
      />

      <VoiceModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </SafeAreaView>
  );
};

export default TaskListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    // borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  themeButton: {
    padding: spacing.sm,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  searchContainer: {
    flex: 1,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.lg + spacing.md,
    paddingRight: spacing.md,
    fontSize: fontSize.lg,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl + 56,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.xxl + 56,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
  },
});
