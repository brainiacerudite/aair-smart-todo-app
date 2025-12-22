export interface Task {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    dueDate?: number;
    createdAt: number;
}

export type TaskSection = {
    title: string;
    data: Task[];
};

export type ThemeMode = 'light' | 'dark';

export interface Theme {
    mode: ThemeMode;
    colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        textSecondary: string;
        border: string;
        error: string;
        success: string;
        shadow: string;
    };
}

export interface ParsedTask {
    title: string;
    description?: string;
}

export type SortOrder =
    | 'title-asc'
    | 'title-desc'
    | 'dueDate-asc'
    | 'dueDate-desc';

export interface AIProvider {
    name: string;
    transcribeAudio(audioUri: string): Promise<string>;
    parseTasks(text: string): Promise<string[]>;
}