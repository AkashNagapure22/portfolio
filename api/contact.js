import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, _subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const sql = neon(process.env.POSTGRES_URL);

    await sql`
      INSERT INTO contact_submissions (full_name, email, subject, message)
      VALUES (${name}, ${email}, ${_subject || 'No Subject'}, ${message});
    `;

    return res.status(200).json({ success: true, message: 'Message saved to database!' });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ error: 'Failed to write to database.' });
  }
}
