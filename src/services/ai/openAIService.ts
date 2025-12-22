import { parseTasksApi, transcribeAudioApi } from '@/src/api/openAIClient';
import { AIProvider } from '@/src/types';

export const OpenAIService: AIProvider = {
    name: 'OpenAI',

    transcribeAudio: async (audioUri: string): Promise<string> => {
        try {
            const formData = new FormData()
            // @ts-ignore
            formData.append('file', {
                uri: audioUri,
                type: 'audio/m4a',
                name: 'audio.m4a'
            })
            formData.append('model', 'whisper-1')

            const transcription = await transcribeAudioApi(formData)

            if (!transcription.text) {
                throw new Error(transcription.error?.message || 'Transcription failed')
            }

            return transcription.text
        } catch (error) {
            console.log('OpenAI Transcription Error:', error);
            throw new Error('Transcription failed');
        }
    },

    parseTasks: async (text: string): Promise<string[]> => {
        try {
            const content = await parseTasksApi(text)

            if (!content) {
                // console.log('No response from GPT')
                // return []
                throw new Error('No response from GPT')
            }

            const parsed = JSON.parse(content)

            // handle different possible response formats
            if (Array.isArray(parsed)) {
                return parsed
            } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
                return parsed.tasks
            } else if (parsed.items && Array.isArray(parsed.items)) {
                return parsed.items
            }

            return [text]
        } catch (error) {
            console.log('GPT parsing error:', error)
            return [text]
        }
    }
}