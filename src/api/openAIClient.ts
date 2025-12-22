import OpenAI from 'openai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY

if (!apiKey) {
    throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not defined in environment variables");
}

export const openai = new OpenAI({
    apiKey,
})

export const transcribeAudioApi = async (formData: FormData) => {
    // const res = await openai.audio.transcriptions.create({
    //     file: formData.get('file') as File,
    //     model: 'whisper-1',
    // });
    // return res;

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'multipart/form-data'
        },
        body: formData
    })
    const transcription = await res.json()
    return transcription;
}

export const parseTasksApi = async (text: string) => {
    const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are a task parser. Split the user input into individual task items. Return ONLY a JSON array of strings, where each string is a single task. If the input contains multiple tasks, separate them. If it\'s a single task, return an array with one item. Do not include any explanation or markdown formatting.'
            },
            {
                role: 'user',
                content: text
            }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
    })

    const content = res.choices[0]?.message?.content
    return content

}