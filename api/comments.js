import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Pulls the DATABASE_URL environment variable set in Vercel
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Fetch all comments ordered by newest first
    if (req.method === 'GET') {
      const comments = await sql`
        SELECT id, author, content, created_at 
        FROM comments 
        ORDER BY created_at DESC
      `;
      return res.status(200).json(comments);
    } 

    // Insert a new comment into the database
    if (req.method === 'POST') {
      const { author, content } = req.body;

      if (!author?.trim() || !content?.trim()) {
        return res.status(400).json({ error: 'Author and content are required.' });
      }

      await sql`
        INSERT INTO comments (author, content) 
        VALUES (${author.trim()}, ${content.trim()})
      `;

      return res.status(201).json({ message: 'Comment posted successfully.' });
    }

    // Handle unsupported HTTP methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Database Connection Error:', error);
    return res.status(500).json({ error: 'Failed to process request.' });
  }
}