import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { env } from 'node:process';

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

        // [중요] Vercel 환경 변수 오류 시, 아래 따옴표 "" 안에 직접 API Key를 붙여넣으세요.
        // 예: const HARDCODED_KEY = "AIzaSy...";
        const HARDCODED_KEY = "";

        // 환경 변수 또는 하드코딩된 키 사용
        const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || HARDCODED_KEY;

        if (!apiKey) {
            // 모든 키 출력 (보안상 값은 제외)
            const allKeys = Object.keys(env);
            console.error('SERVER: API Key Missing. All Keys:', allKeys);
            return res.status(500).json({
                error: `Server Build Error: API Key not found.`,
                debug_info: `All Env Keys: ${allKeys.join(', ') || 'EMPTY_OBJECT'}`
            });
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
