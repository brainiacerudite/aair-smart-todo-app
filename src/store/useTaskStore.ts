import { create } from "zustand";
import { SortOrder, Task } from "../types";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TaskStore {
    tasks: Task[]
    loading: boolean
    error: string | null
    searchQuery: string
    sortOrder: SortOrder

    // actions
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
    addTasks: (tasks: Omit<Task, 'id' | 'createdAt'>[]) => void
    toggleTask: (id: string) => void
    deleteTask: (id: string) => void
    updateTask: (id: string, updates: Partial<Task>) => void
    clearAllTasks: () => void
    setSearchQuery: (query: string) => void
    setSortOrder: (order: SortOrder) => void
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            tasks: [],
            loading: false,
            error: null,
            searchQuery: "",
            sortOrder: 'dueDate-asc',

            // actions
            addTask: (taskData) => {
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        {
                            ...taskData,
                            id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
                            createdAt: Date.now(),
                            isCompleted: false,
                        },
                    ],
                }))
            },

            addTasks: (tasksData) => {
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        ...tasksData.map((taskData, index) => ({
                            ...taskData,
                            id: `task_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 11)}`,
                            createdAt: Date.now() + index,
                            isCompleted: false,
                        })),
                    ],
                }))
            },

            toggleTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
                    ),
                }))
            },

            deleteTask: (id) => {
                set((state) => ({
                    tasks: state.tasks.filter((task) => task.id !== id),
                }))
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, ...updates } : task
                    ),
                }))
            },

            clearAllTasks: () => {
                set({ tasks: [] })
            },

            setSearchQuery: (query) => {
                set({ searchQuery: query })
            },

            setSortOrder: (order) => {
                set({ sortOrder: order })
            },
        }),
        {
            name: "task-storage",
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
)