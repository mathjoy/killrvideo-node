import Promise from 'bluebird';
import { cassandra } from '../common/cassandra';

/**
 * A comment on a video.
 * @typedef {object} VideoComment
 * @property {string} videoId - The video's uuid.
 * @property {string} userId - The comment author's uuid.
 * @property {string} commentId - A uuid for the comment.
 * @property {date} addedDate - The date the comment was added.
 * @property {string} comment - The text of the comment.
 */

/**
 * A page of comments.
 * @typedef {object} VideoComments
 * @property {Array.<VideoComment>} comments - An array of comments.
 * @property {string} pagingToken - A paging token that can be used to get more pages.
 */

/**
 * Gets a page of comments posted by a given user.
 * 
 * @param {string} userId - The user's id.
 * @param {int} pageSize - The number of comments to retrieve.
 * @param {string} pagingToken - A token that indicates the current paging state.
 * @returns {Promise.<VideoComments>} A page of comments.
 */
export function getUserComments(userId, pageSize, pagingToken) {
  const queryOptions = {
    pageState: pagingToken,
    fetchSize: pageSize,
    autoPage: false
  };
  
  return cassandra
    .executeAsync('SELECT commentid, videoid, comment, dateOf(commentid) as addedDate FROM comments_by_user WHERE userid = ?', [ userId ], queryOptions)
    .then(results => results.rows.map(row => {
      const comment = mapRowToVideoComment(row);
      comment.userId = userId;
    }));
};

/**
 * Gets a page of comments for a given video.
 * 
 * @param {string} videoId - The video to retrieve the comments for.
 * @param {int} pageSize - The number of comments to retrieve.
 * @param {string} pagingToken - A token representing the current paging state.
 * @returns {Promise.<VideoComments>} A page of comments. 
 */
export function getVideoComments(videoId, pageSize, pagingToken) {
  const queryOptions = {
    pageState: pagingToken,
    fetchSize: pageSize,
    autoPage: false
  };
  
  return cassandra
    .executeAsync('SELECT commentid, userid, comment, dateOf(commentid) AS addedDate FROM comments_by_video WHERE videoid = ?', [ videoId ], queryOptions)
    .then(results => results.rows.map(row => {
      const comment = mapRowToVideoComment(row);
      comment.videoId = videoId;
    }));
};

/**
 * Posts a comment on a video.
 * 
 * @param {string} videoId - The uuid of the video to comment on.
 * @param {string} userId - The uuid of the user authoring the comment.
 * @param {string} comment - The text of the comment.
 * @returns {Promise.<VideoComment>} A Promise with the video comment that was created.
 */
export function commentOnVideo(videoId, userId, comment) {
  // TODO: Needs message bus
  return Promise.reject(new Error('TODO: Not implemented.'));
};

/**
 * Helper function to map a C* row to a VideoComment object.
 */
function mapRowToVideoComment(row) {
  if (!row) return null;
  
  return {
    videoId: row['videoid'],
    userId: row['userid'],
    commentId: row['commentid'],
    comment: row['comment'],
    addedDate: row['addedDate']
  };
}