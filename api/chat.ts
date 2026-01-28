
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
            // 디버깅을 위해 'GEMINI'나 'API'가 포함된 키 이름만 노출 (보안상 값은 노출 금지)
            const debugKeys = Object.keys(process.env).filter(k => k.toUpperCase().includes('GEMINI') || k.toUpperCase().includes('VITE') || k.toUpperCase().includes('KEY'));
            console.error('SERVER: API Key Missing. Available Keys:', debugKeys);
            return res.status(500).json({
                error: `Server Build Error: API Key not found.`,
                debug_info: `Visible Env Keys: ${debugKeys.join(', ') || 'NONE'}`
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
