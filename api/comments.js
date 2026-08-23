// Centralized Comments & Voting Engine for All Portfolio Pages
(function() {
    const API_URL = '/api/comments';

    // Automatically determine the article_id based on the current page filename
    function getArticleId() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('coins')) return 'coins';
        if (path.includes('food')) return 'food';
        if (path.includes('game')) return 'game';
        if (path.includes('homelab')) return 'homelab';
        if (path.includes('projects')) return 'projects';
        if (path.includes('puzzle')) return 'puzzle';
        if (path.includes('reading')) return 'reading';
        if (path.includes('skills')) return 'skills';
        if (path.includes('courses')) return 'courses';
        if (path.includes('resume')) return 'resume';
        if (path.includes('autopatchblog')) return 'autopatchblog';
        return 'general';
    }

    const ARTICLE_ID = getArticleId();

    function getStoredEmail() {
        return localStorage.getItem('akash_portfolio_user_email') || '';
    }

    function setStoredEmail(email) {
        if (email && email.includes('@')) {
            localStorage.setItem('akash_portfolio_user_email', email.trim());
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const discussionSection = document.getElementById('discussion') || document.querySelector('.discussion-section');
        
        if (!discussionSection) return;

        discussionSection.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <h2 class="font-headline-md text-xl sm:text-2xl text-sky-400 italic tracking-tight font-bold">TECHNICAL DISCUSSION &amp; Q&amp;A</h2>
                <div class="h-px flex-grow bg-white/10"></div>
            </div>

            <form id="comment-form" class="glass-card-3d p-6 sm:p-8 rounded-2xl border border-sky-500/30 space-y-5 shadow-2xl mb-8">
                <h3 class="text-lg font-semibold text-sky-300 tracking-tight font-mono">Join the Engineering Discussion</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" id="author" placeholder="Your Name / Handle *" required class="w-full p-3.5 bg-black/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all text-sm font-mono" />
                    <input type="email" id="email" placeholder="Your Email Address *" required class="w-full p-3.5 bg-black/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all text-sm font-mono" />
                </div>
                <div>
                    <textarea id="content" rows="3" placeholder="Ask a question about lab architecture, share feedback, or start a discussion..." required class="w-full p-3.5 bg-black/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all text-sm"></textarea>
                </div>
                <button type="submit" id="submit-btn" class="px-6 py-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 cursor-pointer font-mono">
                    Post Comment
                </button>
            </form>

            <div id="comments-container" class="space-y-6">
                <p class="text-slate-500 text-sm font-mono">Loading discussion...</p>
            </div>
        `;

        document.getElementById('comment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            const author = document.getElementById('author').value;
            const email = document.getElementById('email').value;
            const content = document.getElementById('content').value;

            if (!email.includes('@')) {
                alert('Please provide a valid email address containing "@".');
                return;
            }

            setStoredEmail(email);
            btn.disabled = true;
            btn.innerText = 'Posting...';

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ author, email, content, parent_id: null, article_id: ARTICLE_ID })
                });

                if (res.ok) {
                    document.getElementById('author').value = '';
                    document.getElementById('content').value = '';
                    await loadComments();
                }
            } catch (err) {
                alert('Network error.');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Post Comment';
            }
        });

        const savedEmail = getStoredEmail();
        const emailInput = document.getElementById('email');
        if (savedEmail && emailInput) {
            emailInput.value = savedEmail;
        }

        loadComments();
    });

    async function loadComments() {
        const container = document.getElementById('comments-container');
        if (!container) return;
        try {
            const response = await fetch(`${API_URL}?article_id=${encodeURIComponent(ARTICLE_ID)}`);
            const comments = await response.json();

            if (!response.ok) throw new Error();

            if (!comments || comments.length === 0) {
                container.innerHTML = '<p class="text-slate-500 text-sm font-mono">No comments yet. Be the first to start the discussion!</p>';
                return;
            }

            const commentMap = {};
            const topLevelComments = [];

            comments.forEach(comment => {
                comment.replies = [];
                commentMap[comment.id] = comment;
                if (comment.parent_id) {
                    if (commentMap[comment.parent_id]) {
                        commentMap[comment.parent_id].replies.push(comment);
                    }
                } else {
                    topLevelComments.push(comment);
                }
            });

            container.innerHTML = topLevelComments.map(comment => renderCommentNode(comment)).join('');
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            container.innerHTML = '<p class="text-slate-400 text-sm font-mono">No active comment server detected.</p>';
        }
    }

    function renderCommentNode(comment) {
        const formattedDate = comment.created_at ? new Date(comment.created_at).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        }) : 'Just now';

        const repliesHTML = comment.replies && comment.replies.length > 0 
            ? `<div class="mt-4 pl-4 md:pl-6 border-l-2 border-sky-500/20 space-y-4">
                ${comment.replies.map(reply => renderCommentNode(reply)).join('')}
               </div>`
            : '';

        return `
            <div class="p-5 glass-card-3d rounded-2xl border border-slate-800 space-y-3 shadow-xl" id="comment-${comment.id}">
                <div class="flex items-center justify-between text-xs text-slate-400">
                    <span class="font-bold text-sky-400 text-sm font-mono">${escapeHTML(comment.author)}</span>
                    <span class="text-slate-500 font-mono">${formattedDate}</span>
                </div>
                
                <p class="text-slate-300 text-sm whitespace-pre-line leading-relaxed">${escapeHTML(comment.content)}</p>
                
                <div class="flex items-center space-x-4 text-xs pt-2">
                    <button type="button" onclick="handleVote(${comment.id}, 'like')" class="inline-flex items-center space-x-1 text-slate-400 hover:text-emerald-400 transition-colors bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 cursor-pointer">
                        <span class="material-symbols-outlined text-sm">thumb_up</span>
                        <span>${comment.likes || 0}</span>
                    </button>
                    <button type="button" onclick="handleVote(${comment.id}, 'dislike')" class="inline-flex items-center space-x-1 text-slate-400 hover:text-rose-400 transition-colors bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 cursor-pointer">
                        <span class="material-symbols-outlined text-sm">thumb_down</span>
                        <span>${comment.dislikes || 0}</span>
                    </button>
                    <button type="button" onclick="toggleReplyForm(${comment.id})" class="inline-flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 font-mono cursor-pointer">
                        <span class="material-symbols-outlined text-sm">reply</span>
                        <span>Reply</span>
                    </button>
                </div>

                <form id="reply-form-${comment.id}" class="hidden space-y-3 mt-4 pt-4 border-t border-slate-800 bg-black/40 p-4 rounded-xl">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" id="reply-author-${comment.id}" placeholder="Your Name *" required class="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono" />
                        <input type="email" id="reply-email-${comment.id}" placeholder="Your Email *" required class="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono" />
                    </div>
                    <textarea id="reply-content-${comment.id}" rows="2" placeholder="Write a reply..." required class="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"></textarea>
                    <div class="flex space-x-2">
                        <button type="button" onclick="postReply(${comment.id})" class="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg shadow font-mono cursor-pointer">Submit Reply</button>
                        <button type="button" onclick="toggleReplyForm(${comment.id})" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg font-mono cursor-pointer">Cancel</button>
                    </div>
                </form>
                ${repliesHTML}
            </div>
        `;
    }

    window.toggleReplyForm = function(commentId) {
        document.getElementById(`reply-form-${commentId}`).classList.toggle('hidden');
    }

    window.handleVote = async function(id, action) {
        let email = getStoredEmail();
        
        // Auto-detect or assign anonymous fingerprint if user hasn't typed an email yet
        if (!email) {
            const emailInput = document.getElementById('email');
            if (emailInput && emailInput.value.trim().includes('@')) {
                email = emailInput.value.trim();
                setStoredEmail(email);
            } else {
                let anonEmail = localStorage.getItem('akash_portfolio_anon_id');
                if (!anonEmail) {
                    anonEmail = 'voter_' + Math.random().toString(36).substring(2, 10) + '@portfolio.local';
                    localStorage.setItem('akash_portfolio_anon_id', anonEmail);
                }
                email = anonEmail;
                setStoredEmail(email);
            }
        }

        try {
            const res = await fetch(API_URL, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, email: email.trim() })
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to record vote.');
                return;
            }

            await loadComments();
        } catch (err) {
            console.error('Failed to vote', err);
            alert('Network error while voting.');
        }
    }

    window.postReply = async function(parentId) {
        const author = document.getElementById(`reply-author-${parentId}`).value;
        const emailField = document.getElementById(`reply-email-${parentId}`);
        const email = emailField.value;
        const content = document.getElementById(`reply-content-${parentId}`).value;

        if (!author.trim() || !email.trim() || !content.trim() || !email.includes('@')) {
            alert('Please fill out all required fields with a valid email containing "@".');
            return;
        }

        setStoredEmail(email);

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author, email, content, parent_id: parentId, article_id: ARTICLE_ID })
            });
            if (res.ok) {
                document.getElementById(`reply-author-${parentId}`).value = '';
                emailField.value = '';
                document.getElementById(`reply-content-${parentId}`).value = '';
                toggleReplyForm(parentId);
                await loadComments();
            }
        } catch (err) {
            alert('Network error.');
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
})();
