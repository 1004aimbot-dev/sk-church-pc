
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
        await sql`
      CREATE TABLE IF NOT EXISTS qt_records (
        id SERIAL PRIMARY KEY,
        date_key VARCHAR(20) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        if (req.method === 'GET') {
            const { date } = req.query;
            if (!date || Array.isArray(date)) {
                return res.status(400).json({ error: 'Date parameter is required' });
            }

            const { rows } = await sql`SELECT data FROM qt_records WHERE date_key = ${date}`;
            if (rows.length > 0) {
                return res.status(200).json(rows[0].data);
            } else {
                return res.status(200).json(null); // 데이터 없음
            }
        }

        if (req.method === 'POST') {
            const { date_key, data } = req.body;
            if (!date_key || !data) {
                return res.status(400).json({ error: 'Missing date_key or data' });
            }

            await sql`
        INSERT INTO qt_records (date_key, data)
        VALUES (${date_key}, ${JSON.stringify(data)})
        ON CONFLICT (date_key)
        DO UPDATE SET data = ${JSON.stringify(data)};
      `;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
