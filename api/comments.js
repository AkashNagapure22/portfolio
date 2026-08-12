import { sql } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { method } = req;

  try {
    // 1. GET COMMENTS FOR SPECIFIC ARTICLE
    if (method === 'GET') {
      const { article_id } = req.query;

      // Fallback if article_id is missing so it doesn't break old links
      const targetArticle = article_id || 'general';

      const comments = await sql`
        SELECT * FROM comments 
        WHERE article_id = ${targetArticle} 
        ORDER BY created_at ASC
      `;

      return res.status(200).json(comments);
    }

    // 2. POST NEW COMMENT / REPLY
    if (method === 'POST') {
      const { author, email, content, parent_id, article_id } = req.body;

      if (!author || !email || !content) {
        return res.status(400).json({ error: 'Author, email, and content are required.' });
      }

      const targetArticle = article_id || 'general';

      const [newComment] = await sql`
        INSERT INTO comments (author, email, content, parent_id, article_id)
        VALUES (${author}, ${email}, ${content}, ${parent_id || null}, ${targetArticle})
        RETURNING *
      `;

      return res.status(201).json(newComment);
    }

    // 3. HANDLE VOTE (LIKE / DISLIKE)
    if (method === 'PATCH') {
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

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
