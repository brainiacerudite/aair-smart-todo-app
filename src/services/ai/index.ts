import { OpenAIService } from './openAIService';
import { GeminiService } from './geminiService';
import { DeepgramService } from './deepgramService';
import { AIProvider } from '@/src/types';

const getClient = (): AIProvider => {
    if (process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        return OpenAIService;
    }

    if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        return GeminiService;
    }

    if (process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY) {
        return DeepgramService;
    }

    // fallback to OpenAI
    console.warn('No AI API Key found in .env! Defaulting to OpenAI (requests will fail).');
    return OpenAIService;
};

export const AIService = getClient();