const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
    console.log("Testing Gemini API...");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Hi, respond with a JSON object { \"message\": \"hello\" }",
            config: {
                systemInstruction: "You are a test bot.",
                responseMimeType: "application/json"
            }
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Gemini Error:", e);
        console.error("Error details:", JSON.stringify(e, null, 2));
    }
}

testGemini();
