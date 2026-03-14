
/*
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateResponse = async (message) => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
    }

    const payload = {
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'user',
                content: message
            }
        ]
    };

    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                const err = new Error(`OpenAI API error ${response.status}: ${errorBody}`);
                err.statusCode = response.status;
                err.errorBody = errorBody;

                if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
                    const backoffMs = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
                    await sleep(backoffMs);
                    continue;
                }

                throw err;
            }

            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (!content || typeof content !== 'string') {
                const err = new Error('OpenAI response did not contain assistant content');
                err.statusCode = 502;
                throw err;
            }

            return content;
        } catch (error) {
            if (attempt < maxRetries && (error?.statusCode === 429 || error?.statusCode === 503)) {
                const backoffMs = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
                await sleep(backoffMs);
                continue;
            }
            console.error('Error generating response from OpenAI:', error);
            throw error;
        }
    }
};

module.exports = {
    generateResponse
};
*/
const { GoogleGenAI } = require("@google/genai");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isQuestion = (text) => {
    if (!text || typeof text !== 'string') return false;
    if (text.includes('?')) return true;
    return /^(who|what|when|where|why|how|can|could|should|would|is|are|am|do|does|did|will|may|might)\b/i.test(text.trim());
};

const generateResponse = async (message) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Initialize the client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    

    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // FIX: Access generateContent through the .models property
            const question = isQuestion(message);
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts: [{ text: message }] }],
                config: {
                    systemInstruction: question
                        ? "Answer in 2-3 short sentences. Keep it concise but complete."
                        : "Be concise.",
                    maxOutputTokens: question ? 220 : 280,
                    temperature: 0.4
                }
            });

            // The result is directly on the response object
            return response.text;

        } catch (error) {
            const status = error.status || error.response?.status;
            
            if (attempt < maxRetries && (status === 429 || status === 503)) {
                const backoffMs = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
                await sleep(backoffMs);
                continue;
            }

            console.error('Final error generating response from Gemini:', error);
            throw error;
        }
    }
};

module.exports = { generateResponse };
