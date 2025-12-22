import { parseTasksApi, transcribeAudioApi } from '@/src/api/geminiClient';
import { AIProvider } from '@/src/types';
import * as FileSystem from 'expo-file-system/legacy';

export const GeminiService: AIProvider = {
    name: 'Gemini',

    transcribeAudio: async (audioUri: string): Promise<string> => {
        try {
            // read base64 file
            const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
                encoding: 'base64',
            });

            const data = await transcribeAudioApi(base64Audio);

            if (data.error) {
                throw new Error(data.error.message);
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            // console.log('Transcription response:', text);
            return text || '';

        } catch (error) {
            console.log('Gemini Transcription Error:', error);
            throw new Error('Transcription failed');
        }
    },

    parseTasks: async (text: string): Promise<string[]> => {
        try {
            const data = await parseTasksApi(text);

            if (data.error) {
                throw new Error(data.error.message);
            }

            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(responseText);

            return parsed.tasks || [text];

        } catch (error) {
            console.log('Gemini Parsing Error:', error);
            return [text];
        }
    }
};