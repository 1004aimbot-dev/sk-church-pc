
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 처리 (필요한 경우)
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

    try {
        // 테이블 존재 여부 확인 및 생성 (예약어 이슈 회피를 위해 v2 테이블 생성 및 컬럼명 변경)
        await sql`
      CREATE TABLE IF NOT EXISTS site_contents_v2 (
        section_key VARCHAR(50) PRIMARY KEY,
        content_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        if (req.method === 'GET') {
            const { rows } = await sql`SELECT section_key, content_value FROM site_contents_v2`;
            // 프론트엔드가 기대하는 포맷 { key: value } 로 변환
            const content = rows.reduce((acc, row) => ({ ...acc, [row.section_key]: row.content_value }), {});
            return res.status(200).json(content);
        }

        if (req.method === 'POST') {
            const { key, value } = req.body;
            if (!key || value === undefined) {
                return res.status(400).json({ error: 'Missing key or value' });
            }

            // key -> section_key 매핑 저장
            await sql`
        INSERT INTO site_contents_v2 (section_key, content_value)
        VALUES (${key}, ${value})
        ON CONFLICT (section_key) 
        DO UPDATE SET content_value = ${value}, updated_at = CURRENT_TIMESTAMP;
      `;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error', details: error });
    }
}
