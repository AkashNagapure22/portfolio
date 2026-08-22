/**
 * Vote Manager - Prevents multiple votes from the same user
 * Stores user votes in localStorage with session tracking
 */

class VoteManager {
  constructor(storagePrefix = 'votes_') {
    this.storagePrefix = storagePrefix;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate unique session ID for tracking user votes
   */
  generateSessionId() {
    const stored = localStorage.getItem('user_session_id');
    if (stored) return stored;
    
    const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_session_id', sessionId);
    return sessionId;
  }

  /**
   * Get all votes for a specific article
   */
  getArticleVotes(articleId) {
    const key = this.storagePrefix + articleId;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save votes for an article
   */
  saveArticleVotes(articleId, votes) {
    const key = this.storagePrefix + articleId;
    localStorage.setItem(key, JSON.stringify(votes));
  }

  /**
   * Check if user has already voted on a comment
   */
  hasVoted(articleId, commentId, action) {
    const votes = this.getArticleVotes(articleId);
    const voteKey = `${commentId}_${action}`;
    return votes[voteKey] === this.sessionId;
  }

  /**
   * Record a vote for the current user
   */
  recordVote(articleId, commentId, action) {
    const votes = this.getArticleVotes(articleId);
    const voteKey = `${commentId}_${action}`;
    votes[voteKey] = this.sessionId;
    this.saveArticleVotes(articleId, votes);
  }

  /**
   * Remove a vote for the current user
   */
  removeVote(articleId, commentId, action) {
    const votes = this.getArticleVotes(articleId);
    const voteKey = `${commentId}_${action}`;
    delete votes[voteKey];
    this.saveArticleVotes(articleId, votes);
  }

  /**
   * Get vote state for UI updates
   */
  getVoteState(articleId, commentId) {
    return {
      liked: this.hasVoted(articleId, commentId, 'like'),
      disliked: this.hasVoted(articleId, commentId, 'dislike')
    };
  }

  /**
   * Check if user can vote (hasn't already voted for this action)
   */
  canVote(articleId, commentId, action) {
    return !this.hasVoted(articleId, commentId, action);
  }
}

// Create global instance
const voteManager = new VoteManager();
