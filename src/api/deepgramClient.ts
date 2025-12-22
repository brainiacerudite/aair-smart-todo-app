const apiKey = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY;

if (!apiKey) {
    throw new Error("EXPO_PUBLIC_DEEPGRAM_API_KEY is not defined");
}

export const transcribeAudioApi = async (blob: Blob) => {
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'audio/m4a',
        },
        body: blob,
    });

    const data = await response.json();
    return data;
}
