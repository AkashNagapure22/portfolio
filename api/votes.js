import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    return res.status(500).json({ error: 'POSTGRES_URL environment variable is not set' });
  }

  try {
    const sql = neon(postgresUrl);

    // Handle GET: Fetch helpful/not-helpful vote counts for an article
    if (req.method === 'GET') {
      const { article_id } = req.query;
      const targetArticle = article_id || 'default-article';

      const rows = await sql`
        SELECT article_id AS "articleId",
               COALESCE(helpful, 0) AS "helpful",
               COALESCE(not_helpful, 0) AS "notHelpful"
        FROM votes
        WHERE article_id = ${targetArticle}
        LIMIT 1
      `;

      const data = rows[0] || { helpful: 0, notHelpful: 0 };
      return res.status(200).json(data);
    }

    // Handle POST: Increment helpful or not_helpful counter
    if (req.method === 'POST') {
      const { article_id, vote } = req.body;

      if (!article_id || !vote) {
        return res.status(400).json({ error: 'article_id and vote are required.' });
      }

      const validVotes = ['up', 'down'];
      if (!validVotes.includes(vote)) {
        return res.status(400).json({ error: 'Invalid vote value. Use "up" or "down".' });
      }

      const updated = await sql`
        INSERT INTO votes (article_id, helpful, not_helpful)
        VALUES (${article_id}, ${vote === 'up' ? 1 : 0}, ${vote === 'down' ? 1 : 0})
        ON CONFLICT (article_id) DO UPDATE SET
          helpful = votes.helpful + ${vote === 'up' ? 1 : 0},
          not_helpful = votes.not_helpful + ${vote === 'down' ? 1 : 0}
        RETURNING article_id AS "articleId",
                    helpful,
                    not_helpful AS "notHelpful"
      `;

      return res.status(200).json(updated[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Votes API Error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}