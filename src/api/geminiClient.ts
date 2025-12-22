const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

if (!apiKey) {
    throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not defined");
}

export const transcribeAudioApi = async (base64Audio: string) => {
    const res = await fetch(`${BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: "Transcribe this audio exactly. Do not add timestamps or speaker names." },
                    {
                        inline_data: {
                            mime_type: "audio/m4a",
                            data: base64Audio
                        }
                    }
                ]
            }]
        })
    });

    const data = await res.json();
    return data;
}

export const parseTasksApi = async (text: string) => {
    const response = await fetch(`${BASE_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            generationConfig: {
                response_mime_type: "application/json"
            },
            contents: [{
                parts: [{
                    text: `You are a task parser. Split the user input into individual task items. Return a JSON object with a property "tasks" which is an array of strings. User Input: "${text}"`
                }]
            }]
        })
    });

    const data = await response.json();
    return data;
}