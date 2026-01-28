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

        // [보안] Vercel 환경 변수에서 키를 가져옵니다. (다양한 이름 시도)
        // 또는 클라이언트에서 빌드 타임에 주입된 키를 헤더로 받습니다. (Vercel Env Var 이슈 우회용)
        const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.NEXT_PUBLIC_GEMINI_API_KEY || env.API_KEY || env.GEMINI_KEY || req.headers['x-gemini-api-key'];

        if (!apiKey) {
            // 모든 키 출력 (보안상 값은 제외)
            const allKeys = Object.keys(env);
            console.error('SERVER: API Key Missing. Please check Vercel "Environment Variables" settings.');
            return res.status(500).json({
                error: `Server Build Error: API Key not found.`,
                debug_info: `All Env Keys: ${allKeys.join(', ') || 'EMPTY_OBJECT'}`
            });
        }

        console.log(`SERVER: API Key Found! (Length: ${apiKey.length})`); // 키 로드 성공 로그 추가

        const ai = new GoogleGenAI({ apiKey });

        // 모델 설정 (API 목록에서 확인된 최신 버전)
        const model = 'gemini-2.5-flash';

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
