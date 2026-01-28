
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { title, pastor, passage } = req.body;

        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        // VITE_ prefix가 붙은 키도 혹시 모르니 확인 (로컬에선 .env를 공유할 수 있으므로)

        if (!apiKey) {
            console.error("API Key Missing in Server Environment");
            return res.status(500).json({ error: 'Server Configuration Error: API Key Missing' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `다음 설교 정보를 바탕으로 성도들을 위한 깊이 있고 은혜로운 '설교 요약본'을 작성해 주세요. 
        
        제목: ${title}
        설교자: ${pastor}
        본문: ${passage}
        
        형식:
        1. 핵심 주제 (한 줄 요약)
        2. 주요 내용 (3가지 대지 또는 핵심 포인트)
        3. 적용과 기도 (삶에 적용할 점)
        
        말투: "~합니다", "~습니다"의 경어체로 정중하고 따뜻하게 작성해 주세요.`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        });

        const summary = response.text;

        return res.status(200).json({ summary });

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ error: 'Failed to generate summary', details: error.message });
    }
}
