import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      // Fetch all comments ordered by creation date
      const comments = await sql`
        SELECT id, author, email, content, parent_id, created_at 
        FROM comments 
        ORDER BY created_at ASC
      `;
      return res.status(200).json(comments);
    } 

    if (req.method === 'POST') {
      const { author, email, content, parent_id } = req.body;

      if (!author?.trim() || !email?.trim() || !content?.trim()) {
        return res.status(400).json({ error: 'Author, email, and content are required.' });
      }

      const parentIdValue = parent_id ? parseInt(parent_id, 10) : null;

      await sql`
        INSERT INTO comments (author, email, content, parent_id) 
        VALUES (${author.trim()}, ${email.trim()}, ${content.trim()}, ${parentIdValue})
      `;

      return res.status(201).json({ message: 'Comment or reply posted successfully.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Database transaction failed.' });
  }
}
