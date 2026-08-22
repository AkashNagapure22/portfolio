/**
 * Vote Manager System
 * Prevents users from voting multiple times on the same comment
 * Uses browser localStorage to track votes persistently
 */

const VOTE_MANAGER = {
  // Get storage key for votes
  getVoteKey(articleId) {
    return `votes_${articleId}_${this.getUserId()}`;
  },

  // Generate or retrieve unique user ID from localStorage
  getUserId() {
    let userId = localStorage.getItem('portfolio_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('portfolio_user_id', userId);
    }
    return userId;
  },

  // Check if user has already voted on this comment
  hasVoted(articleId, commentId, action) {
    const votes = JSON.parse(localStorage.getItem(this.getVoteKey(articleId)) || '{}');
    const key = `${commentId}_${action}`;
    return votes[key] === true;
  },

  // Record a vote in localStorage
  recordVote(articleId, commentId, action) {
    const votes = JSON.parse(localStorage.getItem(this.getVoteKey(articleId)) || '{}');
    const key = `${commentId}_${action}`;
    votes[key] = true;
    localStorage.setItem(this.getVoteKey(articleId), JSON.stringify(votes));
  },

  // Clear a vote from localStorage (for testing/resetting)
  clearVote(articleId, commentId, action) {
    const votes = JSON.parse(localStorage.getItem(this.getVoteKey(articleId)) || '{}');
    const key = `${commentId}_${action}`;
    delete votes[key];
    localStorage.setItem(this.getVoteKey(articleId), JSON.stringify(votes));
  },

  // Clear all votes for an article (for testing/resetting)
  clearAllVotes(articleId) {
    localStorage.removeItem(this.getVoteKey(articleId));
  }
};
