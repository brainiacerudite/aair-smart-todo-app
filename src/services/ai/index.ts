import { OpenAIService } from './openAIService';
import { GeminiService } from './geminiService';
import { AIProvider } from '@/src/types';
import { DeepgramService } from './deepgramService';

type AIChoice = 'OPENAI' | 'GEMINI' | 'DEEPGRAM';

const AI_STRATEGY = 'DEEPGRAM' as AIChoice

const getClient = (): AIProvider => {
    switch (AI_STRATEGY) {
        case 'DEEPGRAM':
            return DeepgramService
        case 'GEMINI':
            return GeminiService
        case 'OPENAI':
        default:
            return OpenAIService
    }
};

export const AIService = getClient()