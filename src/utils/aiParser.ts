import { ParsedTask } from "../types"

export const parseTasksFromText = (taskStrings: string[]): ParsedTask[] => {
    return taskStrings.map((taskString) => {
        const trimmed = taskString.trim()

        // check for description separator (e.g., " - " or ": ")
        const separators = [' - ', ': ', ' – ']

        for (const separator of separators) {
            if (trimmed.includes(separator)) {
                const parts = trimmed.split(separator)
                const title = parts[0].trim()
                const description = parts.slice(1).join(separator).trim()

                if (title && description) {
                    return { title, description }
                }
            }
        }

        return { title: trimmed }
    })
}

export const validateParsedTasks = (tasks: ParsedTask[]): boolean => {
    return tasks.length > 0 && tasks.every((task) => task.title.length > 0)
}