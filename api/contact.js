import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, _subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' });
  }

  try {
    const sql = neon(process.env.POSTGRES_URL);

    // Insert payload into PostgreSQL database
    await sql`
      INSERT INTO contact_submissions (full_name, email, subject, message)
      VALUES (${name}, ${email}, ${_subject || 'No Subject'}, ${message});
    `;

    return res.status(200).json({ success: true, message: 'Transmission received successfully!' });
  } catch (error) {
    console.error('Database insertion error:', error);
    return res.status(500).json({ error: 'Failed to process transmission.' });
  }
}