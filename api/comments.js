import { sql } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET: Fetch isolated comments for the page
    if (req.method === 'GET') {
      const article_id = req.query.article_id || 'general';

      const comments = await sql`
        SELECT id, author, email, content, parent_id, likes, dislikes, created_at, article_id
        FROM comments
        WHERE article_id = ${article_id}
        ORDER BY created_at ASC
      `;

      return res.status(200).json(comments || []);
    }

    // 2. POST: Insert comment (SINGLE STATEMENT ONLY)
    if (req.method === 'POST') {
      const { author, email, content, parent_id, article_id } = req.body;

      if (!author || !email || !content) {
        return res.status(400).json({ error: 'Author, email, and content are required.' });
      }

      const targetArticle = article_id || 'general';

      // SINGLE SQL INSERT statement returning the new comment row
      const [newComment] = await sql`
        INSERT INTO comments (author, email, content, parent_id, article_id)
        VALUES (${author}, ${email}, ${content}, ${parent_id || null}, ${targetArticle})
        RETURNING id, author, email, content, parent_id, likes, dislikes, created_at, article_id
      `;

      return res.status(200).json(newComment);
    }

    // 3. PATCH: Update votes
    if (req.method === 'PATCH') {
      const { id, action } = req.body;

      if (!id || !['like', 'dislike'].includes(action)) {
        return res.status(400).json({ error: 'Invalid vote parameters.' });
      }

      if (action === 'like') {
        await sql`UPDATE comments SET likes = COALESCE(likes, 0) + 1 WHERE id = ${id}`;
      } else {
        await sql`UPDATE comments SET dislikes = COALESCE(dislikes, 0) + 1 WHERE id = ${id}`;
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
