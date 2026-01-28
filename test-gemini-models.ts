
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.GEMINI_API_KEY || envConfig.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

async function checkModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log(`Fetching from: https://generativelanguage.googleapis.com/v1beta/models?key=HIDDEN`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", JSON.stringify(data, null, 2));
        } else {
            console.log("Successfully fetched models!");
            if (data.models) {
                console.log("Available Models:");
                data.models.forEach((m: any) => console.log(`- ${m.name}`));
            } else {
                console.log("No models returned?", data);
            }
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

checkModels();
