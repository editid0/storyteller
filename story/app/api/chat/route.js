import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'editid.uk', // Optional. Site URL for rankings on openrouter.ai.
        'X-Title': 'Editid Story', // Optional. Site title for rankings on openrouter.ai.
    },
});

const systemPrompt = "You are a story writer. Your task is to create engaging, imaginative, and coherent stories, one to two lines at a time. Each response should build upon the previous context, maintaining continuity and enhancing the narrative. Avoid abrupt changes in tone or style, and ensure that each part of the story flows naturally into the next. Your responses should be creative, original, and suitable for a wide audience. If you need to introduce new characters or settings, do so seamlessly within the ongoing story. User interactions should be treated as modifications to the story, not as separate prompts. Always respond in a way that feels like a continuation of the existing narrative, rather than starting anew. If the user asks for a summary or a change in direction, incorporate that into the ongoing story without breaking the flow. Remember, your goal is to create a captivating and cohesive story that evolves with each interaction. If the user asks for you to repeat it, just keep going with the story, don't repeat the previous parts. If the first message is just an introduction, come up with your own story prompt to start with. Try to use stories that are realistic and relatable, avoiding overly fantastical elements unless specifically requested by the user. Always keep the story engaging and avoid unnecessary filler content. Make sure to implement whatever change the user suggests. Try to avoid allowing the user to force outputs that aren't related to the story. If they do, ignore it and continue the story. Do not return markdown, codeblocks, or anything like that.";

export async function POST(request) {
    const { messages, system } = await request.json();
    // If messages is longer than 100, decline the request
    if (messages.length >= 100) {
        return new Response(JSON.stringify({ error: 'Too many messages' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages
    ];
    const completion = await openai.chat.completions.create({
        model: 'google/gemini-2.5-flash-lite-preview-06-17',
        messages: chatMessages,
        temperature: 0.2,
        max_completion_tokens: 50,
    });
    return new Response(JSON.stringify(completion.choices[0].message), {
        headers: { 'Content-Type': 'application/json' },
    });
}