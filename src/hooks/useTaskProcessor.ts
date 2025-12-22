import { useCallback, useState } from "react";
import { ParsedTask } from "../types";
import { parseTasksFromText, validateParsedTasks } from "../utils/aiParser";
import { AIService } from "../services/ai";

export const useTaskProcessor = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [originalText, setOriginalText] = useState<string | null>(null);
    const [suggestedTasks, setSuggestedTasks] = useState<ParsedTask[]>([]);

    const processAudioToTasks = useCallback(async (audioUri: string | null): Promise<{ originalText: string; suggestedTasks: ParsedTask[] }> => {
        setIsProcessing(true);
        setError(null);

        if (!audioUri) {
            setIsProcessing(false);
            setError('No audio URI provided');
            throw new Error('No audio URI provided');
        }

        try {
            const transcribedText = await AIService.transcribeAudio(audioUri);
            setOriginalText(transcribedText);

            if (!transcribedText.trim()) {
                // console.log('No text was transcribed from the audio');
                throw new Error('No text was transcribed from the audio');
            }

            let taskStrings: string[] = [];

            try {
                taskStrings = await AIService.parseTasks(transcribedText);
            } catch (gptError) {
                console.warn('GPT parsing failed, using fallback:', gptError);
                taskStrings = [transcribedText];
            }

            const parsedTasks = parseTasksFromText(taskStrings)

            if (!validateParsedTasks(parsedTasks)) {
                const fallbackTasks = [{ title: transcribedText }];
                setSuggestedTasks(fallbackTasks);
                return { originalText: transcribedText, suggestedTasks: fallbackTasks };
            }

            setSuggestedTasks(parsedTasks);
            return { originalText: transcribedText, suggestedTasks: parsedTasks };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to process audio';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    }, [])

    const clearResults = useCallback(() => {
        setOriginalText(null);
        setSuggestedTasks([]);
        setError(null);
    }, []);

    const processAudioToText = useCallback(async (audioUri: string | null): Promise<string> => {
        setIsProcessing(true);
        setError(null);

        if (!audioUri) {
            setIsProcessing(false);
            setError('No audio URI provided');
            throw new Error('No audio URI provided');
        }

        try {
            const transcribedText = await AIService.transcribeAudio(audioUri);

            if (!transcribedText.trim()) {
                throw new Error('No text was transcribed from the audio');
            }

            return transcribedText;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to process audio';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return {
        isProcessing,
        error,
        originalText,
        suggestedTasks,
        processAudioToTasks,
        processAudioToText,
        clearResults,
    };
}