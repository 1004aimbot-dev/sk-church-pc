
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, systemInstruction } = req.body;

        // 환경 변수 가져오기 (VITE_ 접두사 있어도 Node.js에서는 process.env로 접근 가능)
        const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('SERVER: API Key Missing in Environment Variables');
            return res.status(500).json({ error: 'Server Build Error: API Key not found in environment variables.' });
        }

        const ai = new GoogleGenAI({ apiKey });

        // 모델 설정 (안정적인 버전 사용)
        const model = 'gemini-1.5-flash';

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return res.status(200).json({ text: response.text });

    } catch (error: any) {
        console.error('SERVER ERROR:', error);
        return res.status(500).json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        });
    }
}
