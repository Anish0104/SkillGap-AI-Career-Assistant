
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function testRapidAPI() {
    console.log('--- Testing RapidAPI (JSearch) ---');
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        console.error('RAPIDAPI_KEY missing in .env.local');
        return;
    }

    const url = 'https://jsearch.p.rapidapi.com/search?query=Software%20Engineer&num_pages=1';
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('RapidAPI Success! Found', data.data?.length, 'jobs.');
        } else {
            console.error('RapidAPI Error:', response.status, response.statusText);
            const text = await response.text();
            console.error(text);
        }
    } catch (error) {
        console.error('RapidAPI Fetch Crash:', error.message);
    }
}

async function testGemini() {
    console.log('\n--- Testing Gemini API ---');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY missing in .env.local');
        return;
    }

    const { GoogleGenAI } = require('@google/genai');
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say hello!"
        });
        console.log('Gemini Success! Response:', response.text);
    } catch (error) {
        console.error('Gemini Fetch Crash:', error.message);
    }
}

async function runTests() {
    try {
        await testRapidAPI();
        await testGemini();
    } catch (e) {
        console.error('Global error:', e);
    }
}

runTests();
