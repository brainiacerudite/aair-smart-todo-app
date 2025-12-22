import { Appearance, ColorSchemeName } from "react-native";
import { getTheme } from "../theme/colors";
import { ThemeMode, Theme } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

interface ThemeStore {
    themeMode: ThemeMode
    theme: Theme

    // actions
    toggleTheme: () => void
    setTheme: (mode: ThemeMode) => void
}

const getSystemTheme = (): ThemeMode => {
    const colorScheme: ColorSchemeName = Appearance.getColorScheme()
    return colorScheme === 'dark' ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            themeMode: getSystemTheme(),
            theme: getTheme(getSystemTheme()),

            // actions
            toggleTheme: () => {
                set((state) => {
                    const newMode = state.themeMode === 'light' ? 'dark' : 'light';
                    return { themeMode: newMode, theme: getTheme(newMode) };
                })
            },

            setTheme: (mode: ThemeMode) => {
                set({ themeMode: mode, theme: getTheme(mode) })
            }
        }),
        {
            name: "theme-storage",
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
)