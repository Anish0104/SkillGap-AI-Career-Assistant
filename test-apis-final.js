
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

async function testOpenAI() {
    console.log('\n--- Testing OpenAI API (gpt-4o-mini) ---');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OPENAI_API_KEY missing in .env.local');
        return;
    }

    // Log first/last 4 chars of key to verify it's the NEW one
    console.log(`Using key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

    const url = 'https://api.openai.com/v1/chat/completions';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: "Say hello!" }],
                max_tokens: 10
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('OpenAI Success! Response:', data.choices[0]?.message?.content);
        } else {
            console.error('OpenAI Error:', response.status, response.statusText);
            const text = await response.text();
            console.error(text);
        }
    } catch (error) {
        console.error('OpenAI Fetch Crash:', error.message);
    }
}

async function runTests() {
    await testRapidAPI();
    await testOpenAI();
}

runTests();
