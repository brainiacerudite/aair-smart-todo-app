import { useState, useCallback } from 'react';
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync
} from 'expo-audio';

export interface UseVoiceRecorderReturn {
    isRecording: boolean;
    duration: number;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<string | null>;
    togglePause: () => Promise<void>;
    clearError: () => void;
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

    const [error, setError] = useState<string | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);

            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                throw new Error('Permission to access microphone was denied');
            }

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
                shouldPlayInBackground: false,
                interruptionMode: 'doNotMix',
                interruptionModeAndroid: 'doNotMix',
            });

            // record
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to start recording';
            setError(msg);
            console.log('Recording Error:', err);
        }
    }, [audioRecorder]);

    const stopRecording = useCallback(async () => {
        try {
            await audioRecorder.stop();

            const uri = audioRecorder.uri;
            if (uri) {
                return uri;
            }
            return null;
        } catch (err) {
            setError('Failed to stop recording');
            console.log(err);
            return null;
        }
    }, [audioRecorder]);

    const togglePause = useCallback(async () => {
        try {
            if (recorderState.isRecording) {
                audioRecorder.pause();
            } else {
                audioRecorder.record();
            }
        } catch (err) {
            setError('Failed to toggle pause');
        }
    }, [audioRecorder, recorderState.isRecording]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isRecording: recorderState.isRecording,
        duration: recorderState.durationMillis,
        error,
        startRecording,
        stopRecording,
        togglePause,
        clearError
    };
};