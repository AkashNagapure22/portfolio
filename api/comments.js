import { neon } from '@neondatabase/serverless';

// Initialize the SQL client with your Neon DATABASE_URL environment variable
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // CORS Headers
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
    // 1. GET: Fetch comments strictly for the active page
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

    // 2. POST: Insert comment and return the newly inserted row
    if (req.method === 'POST') {
      const { author, email, content, parent_id, article_id } = req.body;

      if (!author || !email || !content) {
        return res.status(400).json({ error: 'Author, email, and content are required.' });
      }

      const targetArticle = article_id || 'general';

      // Execute INSERT
      await sql`
        INSERT INTO comments (author, email, content, parent_id, article_id)
        VALUES (${author}, ${email}, ${content}, ${parent_id || null}, ${targetArticle})
      `;

      // Fetch inserted record
      const rows = await sql`
        SELECT id, author, email, content, parent_id, likes, dislikes, created_at, article_id
        FROM comments
        WHERE email = ${email} AND article_id = ${targetArticle}
        ORDER BY id DESC
        LIMIT 1
      `;

      return res.status(200).json(rows[0]);
    }

    // 3. PATCH: Handle like/dislike counts with unique email restriction
    if (req.method === 'PATCH') {
      const { id, action, email } = req.body;

      if (!id || !email || !['like', 'dislike'].includes(action)) {
        return res.status(400).json({ error: 'Invalid vote parameters or missing email.' });
      }

      try {
        // Attempt to record the vote. 
        // Note: Requires the comment_votes table with a UNIQUE(comment_id, email) constraint.
        await sql`
          INSERT INTO comment_votes (comment_id, email, vote_type)
          VALUES (${id}, ${email}, ${action})
        `;

        // If vote insertion succeeds, increment the counter
        if (action === 'like') {
          await sql`UPDATE comments SET likes = COALESCE(likes, 0) + 1 WHERE id = ${id}`;
        } else {
          await sql`UPDATE comments SET dislikes = COALESCE(dislikes, 0) + 1 WHERE id = ${id}`;
        }

        return res.status(200).json({ success: true, message: 'Vote recorded successfully!' });

      } catch (err) {
        // PostgreSQL unique violation error code (23505) triggers when email already voted on this comment
        if (err.code === '23505') {
          return res.status(400).json({ error: 'You have already voted on this comment.' });
        }
        throw err; // Pass other errors to the main catch block
      }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
