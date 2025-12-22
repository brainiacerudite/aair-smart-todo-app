import { transcribeAudioApi } from "@/src/api/deepgramClient";
import { AIProvider } from "@/src/types";



export const DeepgramService: AIProvider = {
    name: 'Deepgram',

    transcribeAudio: async (audioUri: string): Promise<string> => {
        try {
            // read into a blob
            const fileResponse = await fetch(audioUri);
            const blob = await fileResponse.blob();

            const data = await transcribeAudioApi(blob);

            if (data.error) {
                throw new Error(data.error);
            }

            const transcript = data.results?.channels[0]?.alternatives[0]?.transcript;

            // console.log('Deepgram Transcription:', transcript);
            return transcript || '';

        } catch (error) {
            console.log('Deepgram Transcription Error:', error);
            throw new Error('Transcription failed')
        }
    },

    /**
     * I used a logic-based splitter here since deepgram cannot do that.
     */
    parseTasks: async (text: string): Promise<string[]> => {
        try {
            if (!text) return [];

            // basic delimiters users might use
            const splitPattern = /(?:, and | and | then | also |; |\.)/i;

            const tasks = text
                .split(splitPattern)
                .map(task => task.trim())
                .filter(task =>
                    task.length > 2 && // ignore noise like "ok" or "so"
                    !task.match(/^(ok|okay|so|well)$/i) // ignore filler starts
                );

            const formattedTasks = tasks.map(t => t.charAt(0).toUpperCase() + t.slice(1));

            return formattedTasks.length > 0 ? formattedTasks : [text];
        } catch (error) {
            console.log('Deepgram Parsing Error:', error);
            return [text];
        }
    }
};