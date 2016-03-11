import Promise from 'bluebird';
import { cassandra } from '../common/cassandra';

/**
 * Searches for videos that match the given query and returns the page specified.
 * 
 * @param {string} query - The search term/query
 * @param {number} pageSize - The number of videos per page.
 * @param {string} pagingToken - A token representing the current paging state.
 * @returns {Promise.<SearchResults>} The videos found
 */
export function searchVideos(query, pageSize, pagingToken) {
  const queryOptions = {
    fetchSize: pageSize,
    pageState: pagingToken,
    autoPage: false
  };
  
  return cassandra
    .executeAsync('SELECT videoid, added_date, name, userid, preview_image_location FROM videos_by_tag WHERE tag = ?', [ query ], queryOptions)
    .then(results => results.rows.map(mapRowToVideo));
};

/**
 * Gets search query suggestions for the specified query. Can be used for typeahead support.
 * 
 * @param {string} query - The query to get suggestions for
 * @param {number} limit - The max number of suggestions to retrieve
 * @returns {Promise.<Array.<string>>} A promise that resolves to the query suggestions.
 */
export function getQuerySuggestions(query, limit) {
  const firstLetter = query.substr(0, 1);
  return cassandra
    .executeAsync('SELECT tag FROM tags_by_letter WHERE first_letter = ? AND tag >= ? LIMIT ?', [ firstLetter, query, limit ])
    .then(results => results.rows.map(row => row['tag']));
};

/**
 * Helper function for mapping a C* row to a video for search results.
 */
function mapRowToVideo(row) {
  if (!row) return null;
  return {
    videoId: row['videoid'],
    addedDate: row['added_date'],
    name: row['name'],
    userId: row['userid'],
    previewImageLocation: row['preview_image_location']
  };
}