import Promise from 'bluebird';
import { cassandra } from '../common/cassandra';

/**
 * Rating statistics for a video.
 * @typedef RatingStats
 * @property {number} count - The number of ratings that have been recorded.
 * @property {number} total - The total sum of all the ratings that have been recorded.
 */

/**
 * Gets the current rating stats for a video.
 * 
 * @param {string} videoId - The uuid for the video.
 * @returns {Promise.<RatingStats>} The rating statistics for the video.
 */
export function getRating(videoId) {
  return cassandra
    .executeAsync('SELECT rating_counter, rating_total FROM video_ratings WHERE videoid = ?', [ videoId ])
    .then(results => {
      const row = results.first();
      if (!row) {
        return {
          count: 0,
          total: 0
        };
      }
      
      return {
        count: row['rating_counter'],
        total: row['rating_total']
      };
    });
};

/**
 * Gets a user's rating for a given video.
 * 
 * @param {string} videoId - The video uuid
 * @param {string} userId - The user uuid
 * @returns {Promise.<number>} The rating the user has given the video (will be 0 if not yet rated).
 */
export function getUserRating(videoId, userId) {
  return cassandra
    .executeAsync('SELECT rating FROM video_ratings_by_user WHERE videoid = ? AND userid = ?', [ videoId, userId ])
    .then(results => {
      const row = results.first();
      return row
        ? row['rating']
        : 0;
    });
};

/**
 * Records a rating of a video by a user.
 * 
 * @param {string} videoId - The video uuid
 * @param {string} userId - The user uuid
 * @param {number} rating - The rating on a scale of 1 to 5.
 */
export function rateVideo(videoId, userId, rating) {
  // TODO: Need message bus
  return Promise.reject('TODO: Not implemented');
};