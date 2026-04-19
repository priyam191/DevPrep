const { GoogleGenerativeAI } = require("@google/generative-ai");

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

    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Using gemini-flash-latest which is the standard free version
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: "Answer in 2-3 short sentences. Keep it concise but complete."
    });

    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const question = isQuestion(message);
            
            // Re-configuring model if it's not a question for even more conciseness
            const activeModel = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                systemInstruction: question 
                    ? "Answer in 2-3 short sentences. Keep it concise but complete."
                    : "Be extremely concise."
            });

            const result = await activeModel.generateContent({
                contents: [{ role: "user", parts: [{ text: message }] }],
                generationConfig: {
                    maxOutputTokens: question ? 220 : 280,
                    temperature: 0.4
                }
            });

            const response = await result.response;
            const text = response.text();

            if (!text || typeof text !== 'string') {
                throw new Error('Gemini response did not contain valid assistant content');
            }

            return text.trim();

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
