const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 45000;
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, ms) =>
    Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                const err = new Error(`Gemini request timed out after ${ms}ms`);
                err.code = "GEMINI_TIMEOUT";
                reject(err);
            }, ms);
        }),
    ]);

const isQuestion = (text) => {
    if (!text || typeof text !== "string") return false;
    if (text.includes("?")) return true;
    return /^(who|what|when|where|why|how|can|could|should|would|is|are|am|do|does|did|will|may|might)\b/i.test(text.trim());
};

const isRetryableError = (error) => {
    const status = error.status || error.response?.status;
    if (status === 429 || status === 503) return true;
    if (error.code === "GEMINI_TIMEOUT") return true;
    if (error.message === "fetch failed") return true;
    return false;
};

const logGeminiError = (error, attempt) => {
    const cause = error.cause?.code || error.cause?.message || error.cause;
    console.error(`Gemini error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error.message, cause ? `| cause: ${cause}` : "");
};

const generateResponse = async (message) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const question = isQuestion(message);

    const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: question
            ? "Answer in 2-3 short sentences. Keep it concise but complete."
            : "Be extremely concise.",
    });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await withTimeout(
                model.generateContent({
                    contents: [{ role: "user", parts: [{ text: message }] }],
                    generationConfig: {
                        maxOutputTokens: question ? 220 : 280,
                        temperature: 0.4,
                    },
                }),
                REQUEST_TIMEOUT_MS
            );

            const response = await result.response;
            const text = response.text();

            if (!text || typeof text !== "string") {
                throw new Error("Gemini response did not contain valid assistant content");
            }

            return text.trim();
        } catch (error) {
            logGeminiError(error, attempt);

            if (attempt < MAX_RETRIES && isRetryableError(error)) {
                const backoffMs = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
                await sleep(backoffMs);
                continue;
            }

            throw error;
        }
    }
};

module.exports = { generateResponse };
