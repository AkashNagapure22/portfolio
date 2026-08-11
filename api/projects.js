import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Connects securely using the POSTGRES_URL environment variable from Vercel
  const sql = neon(process.env.POSTGRES_URL);

  try {
    // Fetch data from your database table
    const projects = await sql`SELECT * FROM projects;`;
    
    // Send data back as JSON to your static HTML page
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}