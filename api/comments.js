// api/comments.js
// Example using a simple in-memory or database handler for Vercel Serverless / Express

let commentsStore = [
  {
    id: 'c1',
    articleId: 'default-article',
    author: 'Visitor',
    text: 'Great portfolio structure! Love the 3D grid design.',
    likes: 5,
    dislikes: 0,
    date: new Date().toISOString()
  }
];

export default function handler(req, res) {
  // Enable CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { articleId = 'default-article' } = req.query;

  if (req.method === 'GET') {
    const articleComments = commentsStore.filter(c => c.articleId === articleId);
    return res.status(200).json(articleComments);
  }

  if (req.method === 'POST') {
    const { action, commentId, author, text, targetArticleId } = req.body;

    // Handle adding a new comment
    if (action === 'add') {
      if (!text || !author) {
        return res.status(400).json({ error: 'Author and text are required.' });
      }
      const newComment = {
        id: 'c_' + Date.now(),
        articleId: targetArticleId || articleId,
        author: author.trim(),
        text: text.trim(),
        likes: 0,
        dislikes: 0,
        date: new Date().toISOString()
      };
      commentsStore.push(newComment);
      return res.status(201).json(newComment);
    }

    // Handle liking/disliking a comment
    if (action === 'vote') {
      const comment = commentsStore.find(c => c.id === commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found.' });
      }

      if (req.body.voteType === 'like') {
        comment.likes += 1;
      } else if (req.body.voteType === 'dislike') {
        comment.dislikes += 1;
      }

      return res.status(200).json(comment);
    }

    return res.status(400).json({ error: 'Invalid action.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```[cite: 10]

---

### Step 2: Add Comment & Like/Dislike UI HTML Structure
In your blog or project subpages (e.g., inside your blog template or subpages folder), add the container markup where comments and votes should appear:

```html
<section id="comments-section" class="mt-12 max-w-3xl mx-auto p-6 glass-card-3d rounded-2xl">
  <h3 class="text-xl font-bold text-white mb-6">Discussion & Comments</h3>
  
  <!-- New Comment Form -->
  <form id="comment-form" onsubmit="submitComment(event)" class="space-y-4 mb-8">
    <input type="text" id="comment-author" placeholder="Your Name" required 
      class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-sky-400 focus:outline-none" />
    <textarea id="comment-text" rows="3" placeholder="Write your comment..." required 
      class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-sky-400 focus:outline-none resize-none"></textarea>
    <button type="submit" class="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-lg transition-all">
      Post Comment
    </button>
  </form>

  <!-- Comments Container List -->
  <div id="comments-list" class="space-y-4">
    <!-- Dynamically injected comments will appear here -->
  </div>
</section>
