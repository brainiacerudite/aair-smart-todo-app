import { Theme, ThemeMode } from "../types";

const lightColors = {
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    shadow: '#000000',
};

const darkColors = {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    shadow: '#FFFFFF',
};

export const getTheme = (mode: ThemeMode): Theme => ({
    mode,
    colors: mode === 'light' ? lightColors : darkColors,
});