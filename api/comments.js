import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  // FETCH COMMENTS FOR A SPECIFIC ARTICLE
  if (method === 'GET') {
    const { article_id } = req.query;

    if (!article_id) {
      return res.status(400).json({ error: 'Missing article_id parameter' });
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', article_id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST A NEW COMMENT OR REPLY
  if (method === 'POST') {
    const { author, email, content, parent_id, article_id } = req.body;

    if (!author || !email || !content || !article_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{ author, email, content, parent_id: parent_id || null, article_id }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  // HANDLE VOTES (LIKE / DISLIKE)
  if (method === 'PATCH') {
    const { id, action } = req.body;

    if (!id || !['like', 'dislike'].includes(action)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const field = action === 'like' ? 'likes' : 'dislikes';
    
    // Increment the column value in the database
    const { data, error } = await supabase.rpc('increment_vote', {
      comment_id: id,
      vote_type: field
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
