
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH,DELETE');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // 테이블 생성 (없으면)
        await sql`
      CREATE TABLE IF NOT EXISTS grace_posts (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(50) NOT NULL,
        author_title VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        date_str VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        // GET: 게시글 목록 조회
        if (req.method === 'GET') {
            const { rows } = await sql`SELECT * FROM grace_posts ORDER BY id DESC`; // 최신순
            // 프론트엔드 Post 인터페이스에 맞게 필드 매핑
            const posts = rows.map(row => ({
                id: row.id,
                author: `${row.author_name} ${row.author_title}`,
                date: row.date_str,
                content: row.content,
                likes: row.likes,
                comments: 0 // 댓글 기능은 DB엔 아직 없으므로 0 (추후 확장 가능)
            }));
            return res.status(200).json(posts);
        }

        // POST: 게시글 작성
        if (req.method === 'POST') {
            const { authorName, authorTitle, content, dateStr } = req.body;
            if (!authorName || !content) {
                return res.status(400).json({ error: 'Missing Required Fields' });
            }

            await sql`
        INSERT INTO grace_posts (author_name, author_title, content, date_str, likes)
        VALUES (${authorName}, ${authorTitle}, ${content}, ${dateStr}, 0)
      `;
            return res.status(201).json({ success: true });
        }

        // PATCH: 좋아요 / 수정
        if (req.method === 'PATCH') {
            const { id, type } = req.body; // type: 'like'

            if (type === 'like') {
                await sql`UPDATE grace_posts SET likes = likes + 1 WHERE id = ${id}`;
                return res.status(200).json({ success: true });
            }
        }

        // DELETE: 게시글 삭제
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing ID' });

            await sql`DELETE FROM grace_posts WHERE id = ${id}`;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
