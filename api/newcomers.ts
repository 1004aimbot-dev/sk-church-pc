
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
      CREATE TABLE IF NOT EXISTS newcomers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        birth_date VARCHAR(20),
        address TEXT,
        description TEXT,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        if (req.method === 'GET') {
            const { rows } = await sql`
        SELECT * FROM newcomers 
        ORDER BY registration_date DESC
      `;
            return res.status(200).json(rows);
        }

        if (req.method === 'POST') {
            const { name, phone, birth_date, address, description } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Name is required' });
            }

            await sql`
        INSERT INTO newcomers (name, phone, birth_date, address, description)
        VALUES (${name}, ${phone}, ${birth_date}, ${address}, ${description})
      `;

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        // 테이블이 없을 경우 에러가 발생할 수 있으니 안전장치
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
