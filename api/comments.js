// api/comments.js
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon(process.env.POSTGRES_URL);

    // 1. Ensure table exists (split into safe, concise statements)
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY
      );
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS article_id TEXT NOT NULL DEFAULT 'default';
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT '';
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id INTEGER;
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS dislikes INT DEFAULT 0;
    `;
    await sql`
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `;

    // 2. Handle GET: Fetch comments for a specific article ID
    if (req.method === 'GET') {
      const { article_id } = req.query;
      const targetArticle = article_id || 'default-article';
      
      const comments = await sql`
        SELECT id, article_id as "articleId", author, email, content, parent_id as "parentId", likes, dislikes, created_at as "date"
        FROM comments 
        WHERE article_id = ${targetArticle} 
        ORDER BY created_at ASC;
      `;
      return res.status(200).json(comments);
    }

    // 3. Handle POST: Add new comment or reply
    if (req.method === 'POST') {
      const { author, email, content, parent_id, article_id, targetArticleId } = req.body;
      const finalArticleId = targetArticleId || article_id || 'default-article';

      if (!content || !author) {
        return res.status(400).json({ error: 'Author and content are required.' });
      }

      const newComment = await sql`
        INSERT INTO comments (article_id, author, email, content, parent_id, likes, dislikes)
        VALUES (${finalArticleId}, ${author.trim()}, ${email ? email.trim() : ''}, ${content.trim()}, ${parent_id || null}, 0, 0)
        RETURNING id, article_id as "articleId", author, email, content, parent_id as "parentId", likes, dislikes, created_at as "date";
      `;
      return res.status(201).json(newComment[0]);
    }

    // 4. Handle PATCH/Vote: Increment likes or dislikes
    if (req.method === 'PATCH') {
      const { id, action, voteType } = req.body;
      const type = action || voteType;

      if (!id || !type) {
        return res.status(400).json({ error: 'ID and action type are required.' });
      }

      let updated;
      if (type === 'like') {
        updated = await sql`
          UPDATE comments SET likes = likes + 1 WHERE id = ${id} 
          RETURNING id, article_id as "articleId", author, email, content, parent_id as "parentId", likes, dislikes, created_at as "date";
        `;
      } else if (type === 'dislike') {
        updated = await sql`
          UPDATE comments SET dislikes = dislikes + 1 WHERE id = ${id} 
          RETURNING id, article_id as "articleId", author, email, content, parent_id as "parentId", likes, dislikes, created_at as "date";
        `;
      } else {
        return res.status(400).json({ error: 'Invalid action type.' });
      }

      if (!updated || updated.length === 0) {
        return res.status(404).json({ error: 'Comment not found.' });
      }

      return res.status(200).json(updated[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
